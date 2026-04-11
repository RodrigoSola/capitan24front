import  { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Save } from 'lucide-react';
import './App.css';
const API_URL = 'https://librospapa-api.onrender.com/api/books';

export default function ProductsManagement() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter(product =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.author.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/get`);
      const data = await response.json();
      setProducts(data.products || []);
      setError('');
    } catch (err) {
      setError('Error al cargar los productos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title) {
      setError('Título  es requerido');
      return;
    }

    try {
      setLoading(true);
      const url = editingProduct 
        ? `${API_URL}/update/${editingProduct._id}`
        : `${API_URL}/create`;
      
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          price: Number(formData.price) || 0
          
        })
      });

      if (response.ok) {
        await fetchProducts();
        handleCloseForm();
        setError('');
      } else {
        setError('Error al guardar el producto');
      }
    } catch (err) {
      setError('Error al guardar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      price: product.price || ''
      
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/delete/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchProducts();
        setError('');
      } else {
        setError('Error al eliminar el producto');
      }
    } catch (err) {
      setError('Error al eliminar el producto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      title: '',
      price: ''
    });
  };

  return (
    <div className="app-container">
      <div className="header">
        <h1>📚Administracion de Productos </h1>
        <p>Sistema de administración de inventario</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={() => setError('')} className="close-error">×</button>
        </div>
      )}

      <div className="controls">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por título"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          className="btn-primary"
          onClick={() => setShowForm(true)}
        >
          <Plus size={20} />
          Nuevo Producto
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={handleCloseForm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</h2>
              <button onClick={handleCloseForm} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre del producto *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </div>
             
              <div className="form-row">
                <div className="form-group">
                  <label>Precio</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="1"
                    min="0"
                  />
                </div>
                
              </div>
              <div className="form-actions">
                <button 
                  type="button" 
                  onClick={handleCloseForm}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  <Save size={20} />
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading && !showForm ? (
        <div className="loading">Cargando...</div>
      ) : (
        <div className="products-grid">
          {filteredProducts.length === 0 ? (
            <div className="no-products">
              <p>No se encontraron productos.</p>
            </div>
          ) : (
            filteredProducts.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-header">
                  <h3>{product.title}</h3>
                  <div className="product-actions">
                    <button 
                      className="btn-icon btn-edit"
                      onClick={() => handleEdit(product)}
                      title="Editar"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      className="btn-icon btn-delete"
                      onClick={() => handleDelete(product._id)}
                      title="Eliminar"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <div className="product-body">
                  
                  <div className="product-info">
                    <div className="info-item">
                      <span className="label">Precio:</span>
                      <span className="value price">${product.price || 0}</span>
                    </div>
                    
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      
    </div>
  );
}


