// supabase/functions/upload-radio-r2/index.ts
//
// Fonction Edge Supabase (Deno) qui :
//  1. Vérifie que l'appelant est bien un admin authentifié
//  2. Reçoit un fichier audio envoyé depuis Admin.jsx
//  3. L'upload vers le bucket Cloudflare R2 "rius-radio" via l'API S3
//  4. Renvoie l'URL publique du fichier (à enregistrer dans radio_playlist)
//
// Les clés R2 restent ICI, côté serveur, jamais dans le code frontend.

import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

// --- Variables d'environnement (à définir avec `supabase secrets set`) ---
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const R2_ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const R2_ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID")!;
const R2_SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY")!;
const R2_BUCKET_NAME = Deno.env.get("R2_BUCKET_NAME") ?? "rius-radio";
// URL publique de lecture : soit un domaine personnalisé branché sur le bucket,
// soit l'URL r2.dev si tu l'as activée pour ce bucket.
const R2_PUBLIC_BASE_URL = Deno.env.get("R2_PUBLIC_BASE_URL")!;

// Types de fichiers audio acceptés + taille max (ex: 50 Mo)
const ALLOWED_MIME_TYPES = [
  "audio/mpeg",
  "audio/mp3",
  "audio/wav",
  "audio/x-wav",
  "audio/ogg",
  "audio/mp4",
  "audio/aac",
];
const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo

const r2 = new AwsClient({
  accessKeyId: R2_ACCESS_KEY_ID,
  secretAccessKey: R2_SECRET_ACCESS_KEY,
  region: "auto",
  service: "s3",
});
const R2_ENDPOINT = `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Ajuste l'origine si besoin en production plutôt que "*"
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "authorization, content-type",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
    },
  });
}

function sanitizeFileName(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // enlève les accents
    .replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

serve(async (req) => {
  // Pré-vol CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, content-type",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
      },
    });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Méthode non autorisée" }, 405);
  }

  try {
    // --- 1. Authentification : vérifier le token envoyé par le frontend ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Non authentifié" }, 401);
    }

    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } =
      await supabaseAuth.auth.getUser(token);

    if (userError || !userData?.user) {
      return jsonResponse({ error: "Session invalide" }, 401);
    }

    // --- 2. Vérifier que l'utilisateur est bien admin ---
    // Adapte cette requête à la façon dont tu stockes les rôles admin
    // (table "admins", colonne "role" sur "profiles", etc.)
    const { data: profileRow, error: profileError } = await supabaseAuth
      .from("admin_profiles")
      .select("role")
      .eq("id", userData.user.id)
      .maybeSingle();

    if (profileError || !profileRow || !profileRow.role) {
      return jsonResponse({ error: "Accès refusé : admin requis" }, 403);
    }

    // --- 3. Récupérer le fichier envoyé en multipart/form-data ---
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return jsonResponse({ error: "Aucun fichier reçu" }, 400);
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return jsonResponse(
        { error: `Type de fichier non autorisé : ${file.type}` },
        400,
      );
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return jsonResponse({ error: "Fichier trop volumineux (max 50 Mo)" }, 400);
    }

    // --- 4. Construire un nom de fichier unique et propre ---
    const timestamp = Date.now();
    const cleanName = sanitizeFileName(file.name);
    const objectKey = `radio/${timestamp}-${cleanName}`;

    // --- 5. Upload vers R2 ---
    const arrayBuffer = await file.arrayBuffer();
    const uploadUrl = `${R2_ENDPOINT}/${R2_BUCKET_NAME}/${objectKey}`;
    const uploadRes = await r2.fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: arrayBuffer,
    });
    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      throw new Error(`Échec upload R2 (${uploadRes.status}): ${errText}`);
    }

    const publicUrl = `${R2_PUBLIC_BASE_URL.replace(/\/$/, "")}/${objectKey}`;

    return jsonResponse({
      success: true,
      key: objectKey,
      url: publicUrl,
      size: file.size,
      contentType: file.type,
    });
  } catch (err) {
    console.error("Erreur upload R2:", err);
    return jsonResponse({ error: "Erreur serveur lors de l'upload" }, 500);
  }
});
