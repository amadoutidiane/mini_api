// server.js
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ================================
// Données en mémoire
// ================================
let users = [
  { id: 1, name: 'Amadou Sow', email: 'amadou@example.com', age: 28, ville: 'Dakar' },
  { id: 2, name: 'Fatou Diop', email: 'fatou@example.com', age: 25, ville: 'Thiès' },
  { id: 3, name: 'Moussa Fall', email: 'moussa@example.com', age: 30, ville: 'Saint-Louis' }
];
let products = [
  { id: 1, name: 'Ordinateur HP', price: 350000, stock: 15 },
  { id: 2, name: 'Téléphone Samsung', price: 180000, stock: 30 },
  { id: 3, name: 'Tablette iPad', price: 450000, stock: 8 }
];
let idCounter = { users: 104, products: 104 };

// ================================
// Swagger / OpenAPI
// ================================
const PUBLIC_URL = process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL; // Render définit RENDER_EXTERNAL_URL

const swaggerDefinition = {
  openapi: '3.0.3',
  info: {
    title: 'Mini API — Cours React',
    version: '1.0.0',
    description: 'CRUD Users & Products + /health. Swagger UI à /docs'
  },
  servers: [
    {
      url: PUBLIC_URL || `http://localhost:${PORT}`,
      description: 'current'
    }
  ],
  tags: [{ name: 'System' }, { name: 'Users' }, { name: 'Products' }],
  components: {
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Amadou Sow' },
          email: { type: 'string', example: 'amadou@example.com' },
          age: { type: 'integer', nullable: true, example: 28 },
          ville: { type: 'string', nullable: true, example: 'Dakar' }
        }
      },
      Product: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          id: { type: 'integer', example: 1 },
          name: { type: 'string', example: 'Ordinateur HP' },
          price: { type: 'number', example: 350000 },
          stock: { type: 'integer', example: 15 }
        }
      },
      ApiError: {
        type: 'object',
        properties: { error: { type: 'string', example: 'Message erreur' } }
      }
    }
  }
};

// IMPORTANT: utiliser { definition, apis } (et non { swaggerDefinition, apis: [] })
const swaggerSpec = swaggerJSDoc({
  definition: swaggerDefinition,
  apis: [__filename] // on scanne CE fichier pour les blocs @swagger
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

/**
 * @swagger
 * /:
 *   get:
 *     tags: [System]
 *     summary: Accueil
 *     responses:
 *       200: { description: OK }
 */
app.get('/', (_, res) => res.json({ message: 'Mini API OK', docs: '/docs' }));

/**
 * @swagger
 * /health:
 *   get:
 *     tags: [System]
 *     summary: Santé du service
 *     responses:
 *       200:
 *         description: OK
 */
app.get('/health', (_, res) => res.json({ status: 'OK' }));

// ================================
// Users
// ================================
/**
 * @swagger
 * /users:
 *   get:
 *     tags: [Users]
 *     summary: Liste des utilisateurs
 *     responses:
 *       200:
 *         description: Tableau des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/User' }
 *   post:
 *     tags: [Users]
 *     summary: Créer un utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: 'string', example: 'Aïcha Ndiaye' }
 *               email:{ type: 'string', example: 'aicha@example.com' }
 *               age:  { type: 'integer', example: 22 }
 *               ville:{ type: 'string', example: 'Ziguinchor' }
 *     responses:
 *       201:
 *         description: Créé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       400: { description: Données invalides }
 */
app.get('/users', (_, res) => res.json(users));
app.post('/users', (req, res) => {
  const { name, email, age, ville } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'Nom et email requis' });
  const user = { id: idCounter.users++, name, email, age: age ?? null, ville: ville ?? null };
  users.push(user);
  res.status(201).json(user);
});

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Récupérer un utilisateur par id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/User' }
 *       404: { description: Non trouvé }
 *   put:
 *     tags: [Users]
 *     summary: Remplacer totalement un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/User' }
 *     responses:
 *       200: { description: OK }
 *       400: { description: Données invalides }
 *       404: { description: Non trouvé }
 *   patch:
 *     tags: [Users]
 *     summary: Mettre à jour partiellement un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200: { description: OK }
 *       404: { description: Non trouvé }
 *   delete:
 *     tags: [Users]
 *     summary: Supprimer un utilisateur
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supprimé }
 *       404: { description: Non trouvé }
 */
app.get('/users/:id', (req, res) => {
  const u = users.find(x => x.id === parseInt(req.params.id));
  if (!u) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  res.json(u);
});
app.put('/users/:id', (req, res) => {
  const i = users.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const { name, email, age, ville } = req.body || {};
  if (!name || !email) return res.status(400).json({ error: 'PUT nécessite toutes les données' });
  users[i] = { id: users[i].id, name, email, age: age ?? null, ville: ville ?? null };
  res.json(users[i]);
});
app.patch('/users/:id', (req, res) => {
  const i = users.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  users[i] = { ...users[i], ...req.body };
  res.json(users[i]);
});
app.delete('/users/:id', (req, res) => {
  const i = users.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const removed = users.splice(i, 1)[0];
  res.json({ message: 'Utilisateur supprimé', user: removed });
});

// ================================
// Products
// ================================
/**
 * @swagger
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Liste des produits
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: { $ref: '#/components/schemas/Product' }
 *   post:
 *     tags: [Products]
 *     summary: Créer un produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price]
 *             properties:
 *               name:  { type: string, example: "Téléphone Samsung" }
 *               price: { type: number, example: 180000 }
 *               stock: { type: integer, example: 30 }
 *     responses:
 *       201: { description: Créé }
 *       400: { description: Données invalides }
 */
app.get('/products', (_, res) => res.json(products));
app.post('/products', (req, res) => {
  const { name, price, stock } = req.body || {};
  if (!name || price == null) return res.status(400).json({ error: 'Nom et prix requis' });
  const product = { id: idCounter.products++, name, price, stock: stock ?? 0 };
  products.push(product);
  res.status(201).json(product);
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Récupérer un produit par id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: OK
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Product' }
 *       404: { description: Non trouvé }
 *   put:
 *     tags: [Products]
 *     summary: Remplacer totalement un produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/Product' }
 *     responses:
 *       200: { description: OK }
 *       404: { description: Non trouvé }
 *   patch:
 *     tags: [Products]
 *     summary: Mettre à jour partiellement un produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             additionalProperties: true
 *     responses:
 *       200: { description: OK }
 *       404: { description: Non trouvé }
 *   delete:
 *     tags: [Products]
 *     summary: Supprimer un produit
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Supprimé }
 *       404: { description: Non trouvé }
 */
app.get('/products/:id', (req, res) => {
  const p = products.find(x => x.id === parseInt(req.params.id));
  if (!p) return res.status(404).json({ error: 'Produit non trouvé' });
  res.json(p);
});
app.put('/products/:id', (req, res) => {
  const i = products.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  const { name, price, stock } = req.body || {};
  products[i] = { id: products[i].id, name, price, stock: stock ?? 0 };
  res.json(products[i]);
});
app.patch('/products/:id', (req, res) => {
  const i = products.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  products[i] = { ...products[i], ...req.body };
  res.json(products[i]);
});
app.delete('/products/:id', (req, res) => {
  const i = products.findIndex(x => x.id === parseInt(req.params.id));
  if (i === -1) return res.status(404).json({ error: 'Produit non trouvé' });
  const removed = products.splice(i, 1)[0];
  res.json({ message: 'Produit supprimé', product: removed });
});

// ================================
// Démarrage
// ================================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
