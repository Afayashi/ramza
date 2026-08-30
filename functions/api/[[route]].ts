// Cloudflare Pages Function — REST API for رمز الإبداع
interface Env {
  DB: D1Database;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Content-Type': 'application/json',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: CORS });
}

function err(msg: string, status = 400) {
  return json({ error: msg }, status);
}

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  if (request.method === 'OPTIONS') return new Response(null, { headers: CORS });

  const route = (params.route as string[]) || [];
  const entity = route[0];
  const id = route[1];
  const url = new URL(request.url);
  const search = url.searchParams.get('q') || '';

  if (!env.DB) return err('Database not configured', 503);

  const tableMap: Record<string, string> = {
    owners: 'owners',
    properties: 'properties',
    units: 'units',
    tenants: 'tenants',
    contracts: 'contracts',
    docs: 'ownership_docs',
  };

  const table = tableMap[entity];
  if (!table) return err(`Unknown entity: ${entity}`, 404);

  try {
    if (request.method === 'GET') {
      if (id) {
        const row = await env.DB.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(id).first();
        if (!row) return err('Not found', 404);
        return json(row);
      }
      // List with optional search
      const limit = Number(url.searchParams.get('limit') || 200);
      const offset = Number(url.searchParams.get('offset') || 0);
      const ownerId = url.searchParams.get('owner_id');

      let query = `SELECT * FROM ${table}`;
      const bindings: any[] = [];

      const conditions: string[] = [];
      if (ownerId && ['properties', 'units', 'contracts', 'docs'].includes(entity)) {
        conditions.push('owner_id = ?');
        bindings.push(ownerId);
      }
      if (conditions.length) query += ` WHERE ${conditions.join(' AND ')}`;
      query += ` LIMIT ? OFFSET ?`;
      bindings.push(limit, offset);

      const { results } = await env.DB.prepare(query).bind(...bindings).all();
      return json({ data: results, total: results.length });
    }

    if (request.method === 'POST') {
      const body: any = await request.json();
      const keys = Object.keys(body);
      const placeholders = keys.map(() => '?').join(', ');
      const values = keys.map(k => body[k]);
      const stmt = `INSERT INTO ${table} (${keys.map(k => `"${k}"`).join(', ')}) VALUES (${placeholders}) RETURNING *`;
      const row = await env.DB.prepare(stmt).bind(...values).first();
      return json(row, 201);
    }

    if (request.method === 'PUT' && id) {
      const body: any = await request.json();
      const keys = Object.keys(body).filter(k => k !== 'id');
      const sets = keys.map(k => `"${k}" = ?`).join(', ');
      const values = [...keys.map(k => body[k]), id];
      const stmt = `UPDATE ${table} SET ${sets} WHERE id = ? RETURNING *`;
      const row = await env.DB.prepare(stmt).bind(...values).first();
      return json(row);
    }

    if (request.method === 'DELETE' && id) {
      await env.DB.prepare(`DELETE FROM ${table} WHERE id = ?`).bind(id).run();
      return json({ deleted: true });
    }

    return err('Method not allowed', 405);
  } catch (e: any) {
    return err(e.message || 'Internal error', 500);
  }
};
