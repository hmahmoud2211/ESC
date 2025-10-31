const bcrypt = require('bcryptjs');
const { getFirestore } = require('../config/firebase');

class User {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.role = data.role || 'user';
        this.createdAt = data.createdAt || new Date();
    }

    async comparePassword(candidatePassword) {
        return bcrypt.compare(candidatePassword, this.password);
    }

    // Static methods for database operations
    static async findOne(query) {
        const db = getFirestore();
        const usersRef = db.collection('users');
        
        if (query.where) {
            const { email, id } = query.where;
            
            if (id) {
                const doc = await usersRef.doc(id).get();
                if (doc.exists) {
                    return new User({ id: doc.id, ...doc.data() });
                }
                return null;
            }
            
            if (email) {
                const snapshot = await usersRef.where('email', '==', email).limit(1).get();
                if (!snapshot.empty) {
                    const doc = snapshot.docs[0];
                    return new User({ id: doc.id, ...doc.data() });
                }
            }
        }
        
        return null;
    }

    static async findByPk(id) {
        const db = getFirestore();
        const doc = await db.collection('users').doc(id).get();
        
        if (doc.exists) {
            return new User({ id: doc.id, ...doc.data() });
        }
        
        return null;
    }

    static async findAll(query = {}) {
        const db = getFirestore();
        let usersRef = db.collection('users');
        
        if (query.where) {
            Object.keys(query.where).forEach(key => {
                usersRef = usersRef.where(key, '==', query.where[key]);
            });
        }
        
        const snapshot = await usersRef.get();
        return snapshot.docs.map(doc => new User({ id: doc.id, ...doc.data() }));
    }

    static async create(userData) {
        const db = getFirestore();
        
        // Hash password before saving
        if (userData.password) {
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.password, salt);
        }
        
        const userDoc = {
            name: userData.name,
            email: userData.email,
            password: userData.password,
            role: userData.role || 'user',
            createdAt: new Date()
        };
        
        const docRef = await db.collection('users').add(userDoc);
        return new User({ id: docRef.id, ...userDoc });
    }

    async save() {
        const db = getFirestore();
        
        // Hash password if it was changed
        if (this.password && !this.password.startsWith('$2a$')) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }
        
        const userData = {
            name: this.name,
            email: this.email,
            password: this.password,
            role: this.role,
            createdAt: this.createdAt
        };
        
        if (this.id) {
            await db.collection('users').doc(this.id).set(userData, { merge: true });
        } else {
            const docRef = await db.collection('users').add(userData);
            this.id = docRef.id;
        }
        
        return this;
    }

    async destroy() {
        const db = getFirestore();
        if (this.id) {
            await db.collection('users').doc(this.id).delete();
        }
    }

    static async destroy(options) {
        const db = getFirestore();
        if (options.where) {
            const users = await this.findAll({ where: options.where });
            await Promise.all(users.map(user => user.destroy()));
        }
    }
}

module.exports = User; 