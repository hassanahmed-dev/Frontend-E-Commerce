"use client";
import React, { useState, useEffect } from 'react';
import { Drawer, ColorPicker, Select } from 'antd';
import './ProductModal.scss'; // Import the CSS for the modal
import { AiOutlineClose, AiOutlineCloudUpload, AiOutlineDelete } from 'react-icons/ai';

export default function ProductModal({ isOpen, onClose, title, productData, onSubmit }) {
    const [formData, setFormData] = useState({
        productName: '',
        category: '',
        pricePerUnit: '',
        priceAfterDiscount: '',
        shortDescription: '',
        totalStock: '',
        detailedDescription: '',
        image: null,
        colors: [{ color: '', stock: '' }],
    });
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        // Helper to sum color stocks
        const calculateTotalStock = (colors) => {
            return (colors || []).reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
        };

        if (productData) {
            const colors = (productData.colors && Array.isArray(productData.colors))
                ? productData.colors.map(c => ({
                    color: c?.color || '',
                    stock: c?.stock || ''
                }))
                : [{ color: '', stock: '' }];
            setFormData({
                ...productData,
                image: null,
                colors,
                totalStock: calculateTotalStock(colors).toString(),
            });
            setImagePreview(productData.imageUrl || null);
        } else {
            setFormData({
                productName: '',
                category: '',
                pricePerUnit: '',
                priceAfterDiscount: '',
                shortDescription: '',
                totalStock: '0',
                detailedDescription: '',
                image: null,
                colors: [{ color: '', stock: '' }],
            });
            setImagePreview(null);
        }
    }, [productData, isOpen]);

    // Update totalStock whenever colors change
    useEffect(() => {
        const total = (formData.colors || []).reduce((sum, c) => sum + (parseInt(c.stock, 10) || 0), 0);
        setFormData(prev => ({ ...prev, totalStock: total.toString() }));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [formData.colors]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleColorChange = (index, e) => {
        const { name, value } = e.target;
        const newColors = [...formData.colors];
        newColors[index][name] = value;
        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    const handleAddColor = () => {
        setFormData(prev => ({
            ...prev,
            colors: [...prev.colors, { color: '', stock: '' }]
        }));
    };

    const handleRemoveColor = (index) => {
        const newColors = formData.colors.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, colors: newColors }));
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        setFormData(prev => ({ ...prev, image: file }));
        if (file) {
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Required fields
        const requiredFields = [
            'productName',
            'category',
            'pricePerUnit',
            'priceAfterDiscount',
            'shortDescription',
            'detailedDescription',
            'totalStock'
        ];

        for (let field of requiredFields) {
            if (!formData[field] || formData[field].toString().trim() === '') {
                alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1')}.`);
                return;
            }
        }

        // Colors validation
        if (!formData.colors || formData.colors.length === 0 || formData.colors.some(c => !c.color || !c.stock)) {
            alert('Please fill in all color and stock fields.');
            return;
        }

        // Remove image if not uploading new one
        const dataToSend = { ...formData };
        if (!formData.image) {
            delete dataToSend.image;
        }
        if (onSubmit) {
            onSubmit(dataToSend);
        }
    };

    return (
        <Drawer
            open={isOpen}
            onClose={onClose}
            width={600}
            title={<span style={{ fontSize: 20, fontWeight: 700 }}>{title}</span>}
            closable={false}
            styles={{ body: { padding: 24 } }}
            destroyOnClose
        >
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 18,
                    right: 24,
                    background: 'none',
                    border: 'none',
                    fontSize: 22,
                    cursor: 'pointer',
                    zIndex: 1001
                }}
                aria-label="Clodb e"
            >
                <AiOutlineClose />
            </button>
            <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                    <div className="form-group">
                        <label>Product name</label>
                        <input
                            type="text"
                            name="productName"
                            placeholder="Product name"
                            value={formData.productName || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Category</label>
                        <Select
                            name="category"
                            value={formData.category || ''}
                            onChange={value => handleChange({ target: { name: 'category', value } })}
                            style={{ width: '100%' }}
                            placeholder="Category"
                        >
                            <Select.Option value="">Category</Select.Option>
                            <Select.Option value="Mobile Accessories">Mobile Accessories</Select.Option>
                            <Select.Option value="Computers & Accessories">Computers & Accessories</Select.Option>
                            <Select.Option value="TV & Home Entertainment">TV & Home Entertainment</Select.Option>
                            <Select.Option value="Smart Watches">Smart Watches</Select.Option>
                            <Select.Option value="Audio & Buds">Audio & Buds</Select.Option>
                        </Select>
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Price after discount (Rs)</label>
                        <input
                            type="text"
                            name="pricePerUnit"
                            value={formData.pricePerUnit || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Price per unit (Rs)</label>
                        <input
                            type="text"
                            name="priceAfterDiscount"
                            placeholder="Price after discount ($)"
                            value={formData.priceAfterDiscount || ''}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Short Description (Tagline)</label>
                        <input
                            type="text"
                            name="shortDescription"
                            placeholder="248"
                            value={formData.shortDescription || ''}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label>Total stock</label>
                        <input
                            type="text"
                            name="totalStock"
                            placeholder="102010"
                            value={formData.totalStock || ''}
                            readOnly
                        />
                    </div>
                </div>

                <div className="form-group full-width">
                    <label>Detailed Description</label>
                    <textarea
                        name="detailedDescription"
                        placeholder="248"
                        value={formData.detailedDescription || ''}
                        onChange={handleChange}
                    ></textarea>
                </div>

                <div className="form-group full-width">
                    <label>Image</label>
                    <div className="upload-btn-wrapper">
                        <button className="btn upload-btn" type="button">
                            <AiOutlineCloudUpload /> Upload
                        </button>
                        <input type="file" name="image" onChange={handleImageUpload} />
                    </div>
                    {imagePreview && (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{ width: 80, height: 80, objectFit: "cover", marginTop: 8, borderRadius: 6 }}
                        />
                    )}
                </div>

                {(formData.colors || []).map((colorEntry, index) => (
                    <div className="form-row color-stock-row" key={index}>
                        <div className="form-group">
                            <label>Colors</label>
                            <ColorPicker
                                value={colorEntry.color || '#000000'}
                                onChange={(_, hex) => handleColorChange(index, { target: { name: 'color', value: hex } })}
                                showText
                            />
                        </div>
                        <div className="form-group">
                            <label>Stock</label>
                            <input
                                type="text"
                                name="stock"
                                placeholder="500"
                                value={colorEntry.stock || ''}
                                onChange={(e) => handleColorChange(index, e)}
                            />
                        </div>
                        {formData.colors.length > 1 && (
                            <button
                                type="button"
                                onClick={() => handleRemoveColor(index)}
                                className="remove-color-btn"
                            >
                                <AiOutlineDelete />
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={handleAddColor} className="add-more-colors-btn">
                    +Add more colors
                </button>

                <div className="modal-actions" style={{
                    
                    bottom: 0,
                    background: '#fff',
                    padding: '16px 0 0 0',
                   
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 12,
                    borderTop: '1px solid #f0f0f0',
                    marginTop: 32
                }}>
                    <button type="button" onClick={onClose} className="cancel-btn">
                        Cancel
                    </button>
                    <button type="submit" className="add-edit-btn">
                        {title.includes('Add') ? 'Add' : 'Update'}
                    </button>
                </div>
            </form>
        </Drawer>
    );
} 