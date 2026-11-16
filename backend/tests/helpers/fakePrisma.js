// In-memory stand-in for the Prisma client so tests run without PostgreSQL.
const crypto = require('crypto');

let users = [];
let tokens = [];

const pick = (obj, select) =>
  select
    ? Object.fromEntries(Object.keys(select).filter((k) => select[k]).map((k) => [k, obj[k]]))
    : { ...obj };

const matches = (row, where) =>
  Object.entries(where).every(([k, v]) => (v === null ? row[k] == null : row[k] === v));

module.exports = {
  user: {
    async create({ data }) {
      if (users.some((u) => u.email === data.email)) {
        throw Object.assign(new Error('Unique constraint failed'), { code: 'P2002' });
      }
      const user = { id: crypto.randomUUID(), createdAt: new Date(), ...data };
      users.push(user);
      return { ...user };
    },
    async findUnique({ where, select }) {
      const user = users.find((u) => matches(u, where));
      return user ? pick(user, select) : null;
    },
    async findMany({ select } = {}) {
      return [...users].reverse().map((u) => pick(u, select));
    },
  },
  refreshToken: {
    async create({ data }) {
      const token = { id: crypto.randomUUID(), createdAt: new Date(), revokedAt: null, ...data };
      tokens.push(token);
      return { ...token };
    },
    async findUnique({ where }) {
      const token = tokens.find((t) => matches(t, where));
      return token ? { ...token } : null;
    },
    async update({ where, data }) {
      const token = tokens.find((t) => matches(t, where));
      Object.assign(token, data);
      return { ...token };
    },
    async updateMany({ where, data }) {
      const rows = tokens.filter((t) => matches(t, where));
      rows.forEach((t) => Object.assign(t, data));
      return { count: rows.length };
    },
  },
  reset() {
    users = [];
    tokens = [];
  },
};
