'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, Inbox, Image, LogOut, Plus, Trash2, Edit, Save, X, Eye, Film } from 'lucide-react';
import styles from '../admin.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products'); // 'products', 'inquiries', 'gallery'

  // Data States
  const [products, setProducts] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [gallery, setGallery] = useState([]);

  // Form States
  const [productForm, setProductForm] = useState({
    id: null,
    name: '',
    category: 'Secondary Nutrients',
    description: '',
    image: '',
    packaging: '',
    usage: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const [galleryForm, setGalleryForm] = useState({
    title: '',
    url: '',
    type: 'image'
  });
  const [showGalleryForm, setShowGalleryForm] = useState(false);
  const [uploadingProductImage, setUploadingProductImage] = useState(false);
  const [uploadingGalleryMedia, setUploadingGalleryMedia] = useState(false);

  // Authentication check and data fetch
  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const res = await fetch('/api/inquiries');
        if (res.status === 401) {
          router.push('/admin');
          return;
        }
        
        const json = await res.json();
        if (json.success) {
          setAuthorized(true);
          setInquiries(json.data);
          
          // Fetch products & gallery
          const prodRes = await fetch('/api/products');
          const prodJson = await prodRes.json();
          if (prodJson.success) setProducts(prodJson.data);

          const galRes = await fetch('/api/gallery');
          const galJson = await galRes.json();
          if (galJson.success) setGallery(galJson.data);
        } else {
          router.push('/admin');
        }
      } catch (err) {
        router.push('/admin');
      } finally {
        setLoading(false);
      }
    };
    checkAuthAndFetch();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/admin');
    } catch (err) {
      alert('Failed to logout. Please try again.');
    }
  };

  // --- Products CRUD Operations ---
  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing ? `/api/products/${productForm.id}` : '/api/products';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productForm)
      });
      const json = await res.json();

      if (json.success) {
        // Refresh product list
        const prodRes = await fetch('/api/products');
        const prodJson = await prodRes.json();
        if (prodJson.success) setProducts(prodJson.data);

        // Reset Form
        setProductForm({
          id: null,
          name: '',
          category: 'Secondary Nutrients',
          description: '',
          image: '',
          packaging: '',
          usage: ''
        });
        setIsEditing(false);
        setShowProductForm(false);
      } else {
        alert(json.error || 'Failed to save product');
      }
    } catch (err) {
      alert('Error saving product');
    }
  };

  const handleEditClick = (product) => {
    setProductForm(product);
    setIsEditing(true);
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.success) {
        setProducts(products.filter((p) => p.id !== id));
      } else {
        alert(json.error || 'Failed to delete product');
      }
    } catch (err) {
      alert('Error deleting product');
    }
  };

  // --- Gallery Operations ---
  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(galleryForm)
      });
      const json = await res.json();

      if (json.success) {
        setGallery([json.data, ...gallery]);
        setGalleryForm({ title: '', url: '', type: 'image' });
        setShowGalleryForm(false);
      } else {
        alert(json.error || 'Failed to save gallery item');
      }
    } catch (err) {
      alert('Error saving gallery item');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid var(--primary-glow)',
            borderTopColor: 'var(--primary)',
            borderRadius: '50%',
            margin: '0 auto 1rem auto',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p>Verifying secure session...</p>
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  return (
    <div className={`${styles.dashboardWrapper} animate-fade`}>
      <div className="container">
        
        {/* Dashboard Header */}
        <div className={styles.header}>
          <div>
            <span className="badge badge-primary">Workspace</span>
            <h1 style={{ marginTop: '0.2rem' }}>Control Panel Dashboard</h1>
          </div>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ color: 'var(--error)' }}>
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className={styles.navTabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'products' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <LayoutDashboard size={18} />
            <span>Manage Products</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'inquiries' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            <Inbox size={18} />
            <span>Contact Inquiries ({inquiries.length})</span>
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'gallery' ? styles.activeTabBtn : ''}`}
            onClick={() => setActiveTab('gallery')}
          >
            <Image size={18} />
            <span>Manage Gallery</span>
          </button>
        </div>

        {/* --- PRODUCTS TAB VIEW --- */}
        {activeTab === 'products' && (
          <div>
            <div className={styles.actionsBar}>
              <h2>Product Catalog ({products.length})</h2>
              {!showProductForm && (
                <button onClick={() => { setIsEditing(false); setShowProductForm(true); }} className="btn btn-primary">
                  <Plus size={16} />
                  <span>Add Product</span>
                </button>
              )}
            </div>

            {/* Product Add/Edit Form */}
            {showProductForm && (
              <div className={styles.adminFormCard}>
                <h2>{isEditing ? 'Update Product Details' : 'Add New Product'}</h2>
                <form onSubmit={handleProductSubmit}>
                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., EverGrow Nitro-Mag"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Product Category</label>
                      <select
                        className="form-select"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                      >
                        <option value="Secondary Nutrients">Secondary Nutrients</option>
                        <option value="Water Soluble Fertilizers">Water Soluble Fertilizers</option>
                        <option value="Liquid Fertilizers">Liquid Fertilizers</option>
                        <option value="Bio-Stimulants">Bio-Stimulants</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Description</label>
                    <textarea
                      rows="3"
                      className="form-input"
                      placeholder="Type details of compound benefits..."
                      value={productForm.description || ''}
                      onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                    ></textarea>
                  </div>

                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Packaging Available</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 1 Kg, 5 Kg, 25 Kg bags"
                        value={productForm.packaging}
                        onChange={(e) => setProductForm({ ...productForm, packaging: e.target.value })}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Recommended Dosage / Crops</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., 2-3 g/L foliar spray"
                        value={productForm.usage}
                        onChange={(e) => setProductForm({ ...productForm, usage: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Product Image File</label>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept="image/*"
                        className="form-input"
                        style={{ padding: '0.4rem', flex: 1 }}
                        disabled={uploadingProductImage}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploadingProductImage(true);
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            });
                            const json = await res.json();
                            if (json.success) {
                              setProductForm(prev => ({ ...prev, image: json.url }));
                            } else {
                              alert(json.error || 'Failed to upload image');
                            }
                          } catch (err) {
                            alert('Error uploading file');
                          } finally {
                            setUploadingProductImage(false);
                          }
                        }}
                      />
                      {productForm.image && (
                        <div style={{ position: 'relative' }}>
                          <img
                            src={productForm.image}
                            alt="Preview"
                            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                          />
                          <button
                            type="button"
                            onClick={() => setProductForm(prev => ({ ...prev, image: '' }))}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: 'var(--error)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '12px',
                              lineHeight: '18px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => { setShowProductForm(false); setIsEditing(false); }}
                      className="btn btn-secondary"
                      disabled={uploadingProductImage}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={uploadingProductImage}>
                      <Save size={16} />
                      <span>{uploadingProductImage ? 'Uploading...' : (isEditing ? 'Save Changes' : 'Create Product')}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table List */}
            {products.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '8px' }}>
                <p>No products registered yet. Click 'Add Product' above.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Product Info</th>
                      <th>Packaging</th>
                      <th>Dosage</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td style={{ width: '80px' }}>
                          <img
                            src={p.image || 'https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?q=80&w=120'}
                            alt={p.name}
                            style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px' }}
                          />
                        </td>
                        <td>
                          <div className={styles.productName}>{p.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold-dark)', fontWeight: 700, textTransform: 'uppercase' }}>{p.category}</div>
                          <p style={{ fontSize: '0.85rem', color: 'var(--light-text)', marginTop: '0.3rem' }}>{p.description}</p>
                        </td>
                        <td>{p.packaging || '-'}</td>
                        <td>{p.usage || '-'}</td>
                        <td>
                          <div className={styles.actionBtns}>
                            <button onClick={() => handleEditClick(p)} className={`${styles.iconBtn} ${styles.editBtn}`} title="Edit">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => handleDeleteProduct(p.id)} className={`${styles.iconBtn} ${styles.deleteBtn}`} title="Delete">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- INQUIRIES TAB VIEW --- */}
        {activeTab === 'inquiries' && (
          <div>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '2rem' }}>Contact Inquiries</h2>
            
            {inquiries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                <p>No queries or messages have been received yet.</p>
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Sender Info</th>
                      <th>Subject & Message</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq) => (
                      <tr key={inq.id}>
                        <td style={{ width: '220px' }}>
                          <div style={{ fontWeight: 700, color: 'var(--primary-deep)' }}>{inq.name}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--light-text)' }}>{inq.email}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--light-text)' }}>{inq.phone}</div>
                        </td>
                        <td>
                          <div className={styles.inquirySubject}>{inq.subject}</div>
                          <p className={styles.inquiryMessage} style={{ marginTop: '0.5rem' }}>{inq.message}</p>
                        </td>
                        <td style={{ width: '150px', fontSize: '0.85rem', color: 'var(--light-text)' }}>
                          {new Date(inq.createdAt).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* --- GALLERY TAB VIEW --- */}
        {activeTab === 'gallery' && (
          <div>
            <div className={styles.actionsBar}>
              <h2>Gallery Assets ({gallery.length})</h2>
              {!showGalleryForm && (
                <button onClick={() => setShowGalleryForm(true)} className="btn btn-primary">
                  <Plus size={16} />
                  <span>Add Gallery Media</span>
                </button>
              )}
            </div>

            {/* Gallery Upload Link Form */}
            {showGalleryForm && (
              <div className={styles.adminFormCard}>
                <h2>Add Photo / Video</h2>
                <form onSubmit={handleGallerySubmit}>
                  <div className={styles.formGrid}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Asset Title</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="e.g., Harvest Success in Gujarat"
                        value={galleryForm.title}
                        onChange={(e) => setGalleryForm({ ...galleryForm, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label className="form-label">Media Type</label>
                      <select
                        className="form-select"
                        value={galleryForm.type}
                        onChange={(e) => setGalleryForm({ ...galleryForm, type: e.target.value })}
                      >
                        <option value="image">Photo (Image)</option>
                        <option value="video">Video</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Upload Gallery File</label>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                      <input
                        type="file"
                        accept={galleryForm.type === 'image' ? 'image/*' : 'video/*'}
                        className="form-input"
                        style={{ padding: '0.4rem', flex: 1 }}
                        disabled={uploadingGalleryMedia}
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (!file) return;
                          setUploadingGalleryMedia(true);
                          const formData = new FormData();
                          formData.append('file', file);
                          try {
                            const res = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            });
                            const json = await res.json();
                            if (json.success) {
                              setGalleryForm(prev => ({ ...prev, url: json.url }));
                            } else {
                              alert(json.error || 'Failed to upload file');
                            }
                          } catch (err) {
                            alert('Error uploading file');
                          } finally {
                            setUploadingGalleryMedia(false);
                          }
                        }}
                      />
                      {galleryForm.url && (
                        <div style={{ position: 'relative' }}>
                          {galleryForm.type === 'image' ? (
                            <img
                              src={galleryForm.url}
                              alt="Preview"
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                            />
                          ) : (
                            <video
                              src={galleryForm.url}
                              style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                              muted
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => setGalleryForm(prev => ({ ...prev, url: '' }))}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              background: 'var(--error)',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '50%',
                              width: '20px',
                              height: '20px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              fontSize: '12px',
                              lineHeight: '18px',
                              fontWeight: 'bold'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button
                      type="button"
                      onClick={() => setShowGalleryForm(false)}
                      className="btn btn-secondary"
                      disabled={uploadingGalleryMedia}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={!galleryForm.url || uploadingGalleryMedia}>
                      <Save size={16} />
                      <span>{uploadingGalleryMedia ? 'Uploading...' : 'Save Asset'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Gallery Item Grids */}
            {gallery.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem', background: '#fff', borderRadius: '8px' }}>
                <p>No gallery items added yet.</p>
              </div>
            ) : (
              <div className={styles.galleryGrid}>
                {gallery.map((item) => (
                  <div
                    key={item.id}
                    className="glass-card"
                    style={{ padding: 0, overflow: 'hidden', height: '220px', position: 'relative' }}
                  >
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <video
                        src={item.url}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        muted
                        preload="metadata"
                      />
                    )}
                    <button
                      onClick={async () => {
                        if (!confirm('Are you sure you want to delete this gallery item?')) return;
                        try {
                          const res = await fetch(`/api/gallery/${item.id}`, { method: 'DELETE' });
                          const json = await res.json();
                          if (json.success) {
                            setGallery(gallery.filter((g) => g.id !== item.id));
                          } else {
                            alert(json.error || 'Failed to delete gallery item');
                          }
                        } catch (err) {
                          alert('Error deleting gallery item');
                        }
                      }}
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(255, 255, 255, 0.9)',
                        border: 'none',
                        borderRadius: '50%',
                        width: '32px',
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: 'var(--error)',
                        boxShadow: 'var(--shadow-sm)',
                        zIndex: 10
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        width: '100%',
                        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                        padding: '1rem',
                        color: '#fff',
                        width: '100%'
                      }}
                    >
                      <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                        {item.type === 'image' ? <Eye size={12} /> : <Film size={12} />}
                        <span style={{ textTransform: 'uppercase' }}>{item.type}</span>
                      </div>
                      <h4 style={{ color: '#fff', fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', width: '100%', margin: 0 }}>
                        {item.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
