require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 5000;

// Veritabanı bağlantı havuzu oluştur (Railway için SSL ayarlarıyla birlikte)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Veritabanı bağlantısını başlangıçta test et
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Veritabanı bağlantı hatası!', err.stack);
  } else {
    console.log('PostgreSQL veritabanına başarıyla bağlanıldı. Zaman:', res.rows[0].now);
  }
});

// Shopify API ayarları
const { SHOPIFY_STORE_URL, SHOPIFY_API_TOKEN, LOCATION_ID } = process.env;
const shopifyApi = axios.create({
    baseURL: `https://${SHOPIFY_STORE_URL}/admin/api/2024-07/`,
    headers: {
        'X-Shopify-Access-Token': SHOPIFY_API_TOKEN,
        'Content-Type': 'application/json',
    },
});

// Gerekli ara katmanlar (middlewares)
app.use(cors());
app.use(express.json());

// Ana API rotası: Shopify'dan ürünleri stoklarıyla birlikte çek
app.get('/api/products', async (req, res) => {
    try {
        const productsResponse = await shopifyApi.get('products.json?fields=id,title,variants');
        const products = productsResponse.data.products;

        const inventoryItemIds = products.flatMap(p => p.variants.map(v => v.inventory_item_id)).join(',');

        const inventoryLevelsResponse = await shopifyApi.get(`inventory_levels.json?inventory_item_ids=${inventoryItemIds}&location_ids=${LOCATION_ID}`);
        const inventoryLevels = inventoryLevelsResponse.data.inventory_levels;

        const productsWithStock = products.flatMap(product => {
            return product.variants.map(variant => {
                const level = inventoryLevels.find(l => l.inventory_item_id === variant.inventory_item_id);
                return {
                    key: variant.id,
                    productId: product.id,
                    productTitle: product.title,
                    variantId: variant.id,
                    variantTitle: variant.title,
                    sku: variant.sku,
                    price: variant.price,
                    stock: level ? level.available : 0,
                    inventory_item_id: variant.inventory_item_id
                };
            });
        });
        
        res.json(productsWithStock);

    } catch (error) {
        console.error('Shopify API hatası:', error.response ? error.response.data : error.message);
        res.status(500).send('Sunucu hatası: Ürünler çekilemedi.');
    }
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});
