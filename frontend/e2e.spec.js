const { test, expect } = require("@playwright/test");
const path = require("path");
const fs = require("fs");
const os = require("os");

const BASE_URL = "http://localhost:3000";
const TEST_USER = "nate";
const TEST_PASS = "123456";

function createIniFile(name, content) {
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

function createStlFile(name) {

  const content = [
    "solid test",
    "  facet normal 0 0 1",
    "    outer loop",
    "      vertex 0 0 0",
    "      vertex 1 0 0",
    "      vertex 0 1 0",
    "    endloop",
    "  endfacet",
    "endsolid test",
  ].join("\n");
  const filePath = path.join(os.tmpdir(), name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

const PROFILE_A_PATH = createIniFile(
  "profile_a.ini",
  [
    "; Profile A — PLA Fine Detail",
    "layer_height = 0.10",
    "perimeters = 4",
    "fill_density = 20%",
    "fill_pattern = gyroid",
    "support_material = 0",
    "retract_length = 0.5",
    "first_layer_speed = 25",
    "external_perimeter_speed = 40",
  ].join("\n")
);

const PROFILE_B_PATH = createIniFile(
  "profile_b.ini",
  [
    "; Profile B — PETG Draft",
    "layer_height = 0.30",
    "perimeters = 2",
    "fill_density = 10%",
    "fill_pattern = rectilinear",
    "support_material = 1",
    "retract_length = 1.0",
    "first_layer_speed = 20",
    "external_perimeter_speed = 60",
  ].join("\n")
);

const STL_PATH = createStlFile("test_model.stl");

const PROFILE_A_NAME = "E2E Profile A — PLA Fine Detail";
const PROFILE_B_NAME = "E2E Profile B — PETG Draft";
const STL_NAME = "test_model.stl";

async function uploadProfile(page, { filePath, name, description, printerType }) {
  await page.goto(`${BASE_URL}/upload`);
  await page.waitForLoadState("networkidle");

  await page.locator("#name").fill(name);
  await page.locator("#printer").fill(printerType);
  await page.locator("#description").fill(description);

  await page.setInputFiles("#file", filePath);

  await page.waitForSelector(`text=${filePath.split("/").pop()}`, { timeout: 5000 }).catch(() => {});

  await page.locator('button[type="submit"]').click();

  await page.waitForURL(/\/profiles\//, { timeout: 15000 });
}

test.describe("Slice Profile Hosting — Full E2E", () => {
  test.setTimeout(90_000);

  let context;
  let page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();

    const API = "http://localhost:8000";

    const loginRes = await fetch(`${API}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ username: TEST_USER, password: TEST_PASS }),
    });
    const { access_token } = await loginRes.json();
    const authHeader = { Authorization: `Bearer ${access_token}` };

    const profilesRes = await fetch(`${API}/api/profiles`, { headers: authHeader });
    const { profiles = [] } = await profilesRes.json();
    await Promise.all(
      profiles
        .filter((p) => p.name?.startsWith("E2E Profile"))
        .map((p) =>
          fetch(`${API}/api/profiles/${p._id ?? p.id ?? p.profile_id}`, {
            method: "DELETE",
            headers: authHeader,
          })
        )
    );

    const stlRes = await fetch(`${API}/api/stl`, { headers: authHeader });
    const { files = [] } = await stlRes.json();
    await Promise.all(
      files
        .filter((f) => f.original_name === STL_NAME)
        .map((f) =>
          fetch(`${API}/api/stl/${f.file_id}`, {
            method: "DELETE",
            headers: authHeader,
          })
        )
    );
  });

  test.afterAll(async () => {
    await context.close();

    [PROFILE_A_PATH, PROFILE_B_PATH, STL_PATH].forEach((f) => {
      try { fs.unlinkSync(f); } catch {}
    });
  });

  test("1 — Login", async () => {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState("networkidle");

    await page.locator('input[name="username"], input[type="text"]').first().fill(TEST_USER);
    await page.locator('input[name="password"], input[type="password"]').first().fill(TEST_PASS);
    await page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign in")').first().click();

    await page.waitForURL((url) => !url.pathname.includes("/login"), { timeout: 10000 });
    expect(page.url()).not.toContain("/login");
  });

  test("2 — Upload Profile A", async () => {
    await uploadProfile(page, {
      filePath: PROFILE_A_PATH,
      name: PROFILE_A_NAME,
      description: "Fine detail PLA profile for E2E testing",
      printerType: "Prusa MK4",
    });

    await expect(page.locator(`h1:has-text("${PROFILE_A_NAME}")`)).toBeVisible({ timeout: 8000 });
  });

  test("3 — Upload Profile B", async () => {
    await uploadProfile(page, {
      filePath: PROFILE_B_PATH,
      name: PROFILE_B_NAME,
      description: "Draft PETG profile for E2E testing",
      printerType: "Bambu X1C",
    });

    await expect(page.locator(`h1:has-text("${PROFILE_B_NAME}")`)).toBeVisible({ timeout: 8000 });
  });

  test("4 — View Profile A detail", async () => {
    await page.goto(`${BASE_URL}/browse`);
    await page.waitForLoadState("networkidle");

    const profileALink = page.locator('a[href^="/profiles/"]').filter({ hasText: "E2E Profile A" }).first();
    await expect(profileALink).toBeVisible({ timeout: 8000 });
    await profileALink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/profiles\//, { timeout: 8000 });

    await expect(page.locator("h1")).toContainText("E2E Profile A");
    await expect(page.locator("pre")).toBeVisible();
    await expect(page.locator('button:has-text("Delete Profile")')).toBeVisible();
    await expect(page.locator('button:has-text("Edit Profile")')).toBeVisible();
  });

  test("5 — Compare Profile A vs Profile B", async () => {
    await page.goto(`${BASE_URL}/compare`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator("#left option:not([value=''])").first()).toBeAttached({ timeout: 10000 });

    const leftOptions = await page.locator("#left option:not([value=''])").all();
    let profileAValue = null;
    let profileBValue = null;

    for (const opt of leftOptions) {
      const label = await opt.textContent();
      const value = await opt.getAttribute("value");
      if (label && label.includes("E2E Profile A")) profileAValue = value;
      if (label && label.includes("E2E Profile B")) profileBValue = value;
    }

    expect(profileAValue).not.toBeNull();
    expect(profileBValue).not.toBeNull();

    await page.locator("#left").selectOption(profileAValue);
    await page.locator("#right").selectOption(profileBValue);

    await expect(page.locator("text=Comparing")).toBeVisible({ timeout: 10000 });

    await expect(page.locator("table").first()).toBeVisible({ timeout: 10000 });

    await page.locator('button:has-text("Unified view")').click();
    await expect(page.locator('button:has-text("Side-by-side view")')).toBeVisible();
  });

  test("6 — Upload STL file", async () => {
    await page.goto(`${BASE_URL}/stl`);
    await page.waitForLoadState("networkidle");

    await page.setInputFiles('input[type="file"]', STL_PATH);

    await expect(page.locator(`text=${STL_NAME}`).first()).toBeVisible({ timeout: 10000 });
  });

  test("7 — View STL file detail", async () => {
    await page.goto(`${BASE_URL}/stl`);
    await page.waitForLoadState("networkidle");

    await Promise.all([
      page.waitForURL(/\/stl\/.+/, { timeout: 10000 }),
      page.locator(`text=${STL_NAME}`).first().click(),
    ]);

    expect(page.url()).toMatch(/\/stl\/.+/);

    await expect(page.locator(`h1:has-text("${STL_NAME}")`)).toBeVisible({ timeout: 8000 });
  });

  test("8 — Delete Profile A", async () => {
    await page.goto(`${BASE_URL}/browse`);
    await page.waitForLoadState("networkidle");

    await page.locator('a[href^="/profiles/"]').filter({ hasText: "E2E Profile A" }).first().click();
    await page.waitForLoadState("networkidle");

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator('button:has-text("Delete Profile")').click();

    await page.waitForURL(`${BASE_URL}/browse`, { timeout: 10000 });

    await expect(page.locator('a[href^="/profiles/"]').filter({ hasText: "E2E Profile A" })).not.toBeVisible();
  });

  test("9 — Delete Profile B", async () => {
    await page.goto(`${BASE_URL}/browse`);
    await page.waitForLoadState("networkidle");

    await page.locator('a[href^="/profiles/"]').filter({ hasText: "E2E Profile B" }).first().click();
    await page.waitForLoadState("networkidle");

    page.once("dialog", (dialog) => dialog.accept());
    await page.locator('button:has-text("Delete Profile")').click();

    await page.waitForURL(`${BASE_URL}/browse`, { timeout: 10000 });
    await expect(page.locator('a[href^="/profiles/"]').filter({ hasText: "E2E Profile B" })).not.toBeVisible();
  });

  test("10 — Delete STL file", async () => {
    await page.goto(`${BASE_URL}/stl`);
    await page.waitForLoadState("networkidle");

    const rows = page.locator("li").filter({ hasText: STL_NAME });
    const countBefore = await rows.count();
    expect(countBefore).toBeGreaterThan(0);

    await rows.first().locator('button:has-text("Delete")').click();

    await expect(rows).toHaveCount(countBefore - 1, { timeout: 8000 });
  });

  test("11 — Logout", async () => {
    const logoutBtn = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out")').first();

    if (await logoutBtn.isVisible()) {
      await logoutBtn.click();
    } else {
      await page.goto(`${BASE_URL}/`);
      await page.waitForLoadState("networkidle");
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
    }

    await page.goto(`${BASE_URL}/compare`);
    await page.waitForLoadState("networkidle");
    await expect(page.locator('h2:has-text("Authentication Required")')).toBeVisible({ timeout: 8000 });
  });
});