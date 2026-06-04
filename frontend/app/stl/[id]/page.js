"use client";
import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAuthToken, isAuthenticated } from "@/lib/authContext";
import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

export default function STLViewerPage() {
  const { id } = useParams();
  const router = useRouter();
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const mountRef = useRef(null);
  const sceneRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    fetchFile();
  }, []);

  const fetchFile = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/stl", {
        headers: { Authorization: `Bearer ${getAuthToken()}` },
      });
      const data = await res.json();
      const match = data.files?.find((f) => f.file_id === id);
      if (!match) throw new Error();
      setFile(match);
    } catch {
      setError("File not found.");
    }
  };

  useEffect(() => {
    if (!file || !mountRef.current) return;

    const mount = mountRef.current;
    const width = mount.clientWidth;
    const height = mount.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x09090b);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 7);
    scene.add(dirLight);
    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.3);
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    fetch(`http://localhost:8000/api/stl/${id}/download`, {
      headers: { Authorization: `Bearer ${getAuthToken()}` },
    })
      .then((r) => r.arrayBuffer())
      .then((buffer) => {
        const loader = new STLLoader();
        const geometry = loader.parse(buffer);
        geometry.computeBoundingBox();
        geometry.computeVertexNormals();

        const center = new THREE.Vector3();
        geometry.boundingBox.getCenter(center);
        geometry.translate(-center.x, -center.y, -center.z);

        const size = new THREE.Vector3();
        geometry.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);
        camera.position.set(0, 0, maxDim * 2);
        controls.update();

        const material = new THREE.MeshPhongMaterial({
          color: 0xe4e4e7,
          specular: 0x444444,
          shininess: 40,
        });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
      });

    const animate = () => {
      sceneRef.current = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(sceneRef.current);
      window.removeEventListener("resize", handleResize);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [file]);

    return (
    <div className="flex flex-col h-screen px-4 py-8">
      <button
        onClick={() => router.push("/stl")}
        className="text-sm text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 mb-4 inline-block w-fit"
      >
        &larr; Back to files
      </button>

      {error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : !file ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
      ) : (
        <>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-1">
            {file.original_name}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
            Left click to rotate &middot; right click to pan &middot; scroll to zoom
          </p>
          <div
            ref={mountRef}
            className="flex-1 rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-800 min-h-0"
          />
        </>
      )}
    </div>
  );
}