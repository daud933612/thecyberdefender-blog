import type { APIRoute } from 'astro';
import fs from 'node:fs/promises';
import path from 'node:path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { title, slug, tag, date, description, content, githubToken, repoOwner, repoName } = data;

    if (!title || !slug || !content) {
      return new Response(JSON.stringify({ error: 'Title, slug, and content are mandatory.' }), { status: 400 });
    }

    const cleanSlug = slug
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const fileContent = `---
title: "${title.replace(/"/g, '\\"')}"
description: "${(description || '').replace(/"/g, '\\"')}"
pubDate: "${date || new Date().toLocaleDateString('en-us', { month: 'short', day: 'numeric', year: 'numeric' })}"
tag: "${tag || 'Cybersecurity'}"
heroImage: ""
---

${content}
`;

    // 1. Direct GitHub API Commit (Used for Live Production Deployments)
    if (githubToken && repoOwner && repoName) {
      const filePath = `src/content/blog/${cleanSlug}.md`;
      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`;
      const encodedContent = Buffer.from(fileContent).toString('base64');

      // Check if file already exists to obtain its SHA
      let sha: string | undefined;
      const checkRes = await fetch(url, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'User-Agent': 'TheCyberDefender-Editor',
        },
      });

      if (checkRes.ok) {
        const fileData = await checkRes.json();
        sha = fileData.sha;
      }

      const commitRes = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'User-Agent': 'TheCyberDefender-Editor',
        },
        body: JSON.stringify({
          message: `Publish post: ${title}`,
          content: encodedContent,
          sha: sha || undefined,
        }),
      });

      if (!commitRes.ok) {
        const err = await commitRes.text();
        return new Response(JSON.stringify({ error: `GitHub API error: ${err}` }), { status: 500 });
      }

      return new Response(JSON.stringify({ success: true, slug: cleanSlug, mode: 'github' }), { status: 200 });
    }

    // 2. Direct Local Filesystem Write (Used during npm run dev / local execution)
    const targetDir = path.resolve(process.cwd(), 'src/content/blog');
    await fs.mkdir(targetDir, { recursive: true });
    const targetFile = path.join(targetDir, `${cleanSlug}.md`);
    await fs.writeFile(targetFile, fileContent, 'utf-8');

    return new Response(JSON.stringify({ success: true, slug: cleanSlug, mode: 'local' }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Internal error' }), { status: 500 });
  }
};