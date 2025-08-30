import React, { useState, useEffect } from 'react';
import { Table, Layout, Spin, Typography, Input } from 'antd';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;
const { Search } = Input;

const App = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // API Adresini ortam değişkeninden al
  const apiUrl = process.env.REACT_APP_API_URL ;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/api/products`);
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Ürünler çekilirken bir hata oluştu:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (value) => {
    const lowercasedValue = value.toLowerCase();
    const filtered = products.filter(item =>
        item.productTitle.toLowerCase().includes(lowercasedValue) ||
        item.variantTitle.toLowerCase().includes(lowercasedValue) ||
        (item.sku && item.sku.toLowerCase().includes(lowercasedValue))
    );
    setFilteredProducts(filtered);
  };

  const columns = [
    { title: 'Ürün Adı', dataIndex: 'productTitle', key: 'productTitle', sorter: (a, b) => a.productTitle.localeCompare(b.productTitle) },
    { title: 'Varyant', dataIndex: 'variantTitle', key: 'variantTitle', render: (text) => text === 'Default Title' ? '-' : text },
    { title: 'SKU (Barkod)', dataIndex: 'sku', key: 'sku' },
    { title: 'Fiyat', dataIndex: 'price', key: 'price', render: (text) => `${text} TL`, sorter: (a, b) => a.price - b.price },
    { title: 'Stok Adedi', dataIndex: 'stock', key: 'stock', sorter: (a, b) => a.stock - b.stock, render: (stock) => (<span style={{ color: stock < 5 ? 'red' : 'inherit', fontWeight: 'bold' }}>{stock}</span>) },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', background: '#fff', padding: '0 24px' }}>
        <Title level={3} style={{ margin: 0 }}>Mağaza Yönetim Paneli</Title>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
          <Search placeholder="Ürün adı, varyant veya SKU'ya göre ara..." onSearch={handleSearch} onChange={(e) => handleSearch(e.target.value)} style={{ marginBottom: 24, width: '400px' }} allowClear enterButton />
          <Spin spinning={loading}>
            <Table dataSource={filteredProducts} columns={columns} rowKey="key" bordered />
          </Spin>
        </div>
      </Content>
      <Footer style={{ textAlign: 'center' }}>
        POS Projesi ©{new Date().getFullYear()}
      </Footer>
    </Layout>
  );
};

export default App;
