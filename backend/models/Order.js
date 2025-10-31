const { getFirestore } = require('../config/firebase');

class Order {
    constructor(data) {
        this.id = data.id;
        this.userId = data.userId;
        this.items = data.items || [];
        this.totalAmount = data.totalAmount;
        this.shippingAddress = data.shippingAddress || null;
        this.status = data.status || 'pending';
        this.paymentStatus = data.paymentStatus || 'pending';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Static methods for database operations
    static async findOne(query) {
        const db = getFirestore();
        const ordersRef = db.collection('orders');
        
        if (query.where) {
            const { id } = query.where;
            
            if (id) {
                const doc = await ordersRef.doc(id).get();
                if (doc.exists) {
                    return new Order({ id: doc.id, ...doc.data() });
                }
                return null;
            }
        }
        
        return null;
    }

    static async findByPk(id) {
        const db = getFirestore();
        const doc = await db.collection('orders').doc(id).get();
        
        if (doc.exists) {
            return new Order({ id: doc.id, ...doc.data() });
        }
        
        return null;
    }

    static async findAll(query = {}) {
        const db = getFirestore();
        let ordersRef = db.collection('orders');
        
        if (query.where) {
            Object.keys(query.where).forEach(key => {
                ordersRef = ordersRef.where(key, '==', query.where[key]);
            });
        }
        
        if (query.order) {
            query.order.forEach(([field, direction]) => {
                ordersRef = ordersRef.orderBy(field, direction.toLowerCase());
            });
        }
        
        const snapshot = await ordersRef.get();
        return snapshot.docs.map(doc => new Order({ id: doc.id, ...doc.data() }));
    }

    static async create(orderData) {
        const db = getFirestore();
        
        const orderDoc = {
            userId: orderData.userId,
            items: orderData.items || [],
            totalAmount: orderData.totalAmount,
            shippingAddress: orderData.shippingAddress || null,
            status: orderData.status || 'pending',
            paymentStatus: orderData.paymentStatus || 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        const docRef = await db.collection('orders').add(orderDoc);
        return new Order({ id: docRef.id, ...orderDoc });
    }

    async save() {
        const db = getFirestore();
        
        const orderData = {
            userId: this.userId,
            items: this.items,
            totalAmount: this.totalAmount,
            shippingAddress: this.shippingAddress,
            status: this.status,
            paymentStatus: this.paymentStatus,
            updatedAt: new Date()
        };
        
        if (this.id) {
            await db.collection('orders').doc(this.id).set(orderData, { merge: true });
        } else {
            orderData.createdAt = new Date();
            const docRef = await db.collection('orders').add(orderData);
            this.id = docRef.id;
            this.createdAt = orderData.createdAt;
        }
        
        this.updatedAt = orderData.updatedAt;
        return this;
    }

    async destroy() {
        const db = getFirestore();
        if (this.id) {
            await db.collection('orders').doc(this.id).delete();
        }
    }

    static async destroy(options) {
        const db = getFirestore();
        if (options.where) {
            const orders = await this.findAll({ where: options.where });
            await Promise.all(orders.map(order => order.destroy()));
        }
    }
}

module.exports = Order; 