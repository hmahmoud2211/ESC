const { getFirestore } = require('../config/firebase');

class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.description = data.description;
        this.price = data.price;
        this.category = data.category;
        this.images = data.images || [];
        this.stock = data.stock || 0;
        this.featured = data.featured || false;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Static methods for database operations
    static async findOne(query) {
        const db = getFirestore();
        const productsRef = db.collection('products');
        
        if (query.where) {
            const { id, name } = query.where;
            
            if (id) {
                const doc = await productsRef.doc(id).get();
                if (doc.exists) {
                    return new Product({ id: doc.id, ...doc.data() });
                }
                return null;
            }
            
            if (name) {
                const snapshot = await productsRef.where('name', '==', name).limit(1).get();
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    return new Product({ id: doc.id, ...doc.data() });
                }
            }
        }
        
        return null;
    }

    static async findByPk(id) {
        const db = getFirestore();
        const doc = await db.collection('products').doc(id).get();
        
        if (doc.exists) {
            return new Product({ id: doc.id, ...doc.data() });
        }
        
        return null;
    }

    static async findAll(query = {}) {
        const db = getFirestore();
        let productsRef = db.collection('products');
        
        if (query.where) {
            Object.keys(query.where).forEach(key => {
                productsRef = productsRef.where(key, '==', query.where[key]);
            });
        }
        
        if (query.order) {
            // Handle ordering if specified
            query.order.forEach(([field, direction]) => {
                productsRef = productsRef.orderBy(field, direction.toLowerCase());
            });
        }
        
        const snapshot = await productsRef.get();
        return snapshot.docs.map(doc => new Product({ id: doc.id, ...doc.data() }));
    }

    static async create(productData) {
        const db = getFirestore();
        
        const productDoc = {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            category: productData.category,
            images: productData.images || [],
            stock: productData.stock || 0,
            featured: productData.featured || false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const docRef = await db.collection('products').add(productDoc);
        return new Product({ id: docRef.id, ...productDoc });
    }

    static async bulkCreate(productsArray) {
        const db = getFirestore();
        const batch = db.batch();
        const createdProducts = [];
        
        for (const productData of productsArray) {
            const productDoc = {
                name: productData.name,
                description: productData.description,
                price: productData.price,
                category: productData.category,
                images: productData.images || [],
                stock: productData.stock || 0,
                featured: productData.featured || false,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            const docRef = db.collection('products').doc();
            batch.set(docRef, productDoc);
            createdProducts.push(new Product({ id: docRef.id, ...productDoc }));
        }
        
        await batch.commit();
        return createdProducts;
    }

    async save() {
        const db = getFirestore();
        
        const productData = {
            name: this.name,
            description: this.description,
            price: this.price,
            category: this.category,
            images: this.images,
            stock: this.stock,
            featured: this.featured,
            updatedAt: new Date()
        };
        
        if (this.id) {
            await db.collection('products').doc(this.id).set(productData, { merge: true });
        } else {
            productData.createdAt = new Date();
            const docRef = await db.collection('products').add(productData);
            this.id = docRef.id;
            this.createdAt = productData.createdAt;
        }
        
        this.updatedAt = productData.updatedAt;
        return this;
    }

    async update(updates) {
        // Update instance properties
        Object.keys(updates).forEach(key => {
            if (updates[key] !== undefined) {
                this[key] = updates[key];
            }
        });
        
        // Save to database
        return this.save();
    }

    async destroy() {
        const db = getFirestore();
        if (this.id) {
            await db.collection('products').doc(this.id).delete();
        }
    }

    static async destroy(options) {
        const db = getFirestore();
        if (options.where) {
            const products = await this.findAll({ where: options.where });
            await Promise.all(products.map(product => product.destroy()));
        }
    }

    static async count() {
        const db = getFirestore();
        const snapshot = await db.collection('products').get();
        return snapshot.size;
    }
}

module.exports = Product; 