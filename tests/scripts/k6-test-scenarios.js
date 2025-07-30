import http from 'k6/http';
import { sleep, check } from 'k6';

export let options = {
    scenarios: {
        // Scénario pour les administrateurs - pic matinal
        admin_users: {
            executor: 'ramping-vus',
            exec: 'adminScenario',
            startVUs: 0,
            stages: [
                // { duration: '30s', target: 20 },
                // { duration: '2m', target: 50 },
                // { duration: '1m', target: 30 },
                // { duration: '1m', target: 10 },
                // { duration: '30s', target: 0 },
                // scenario leger
                { duration: '30s', target: 5 },
                { duration: '1m', target: 10 },
                { duration: '1m', target: 5 },
                { duration: '30s', target: 0 },
            ],
        },
        // Scénario pour le staff - activité constante
        staff_users: {
            executor: 'ramping-vus',
            exec: 'staffScenario', 
            startVUs: 0,
            stages: [
                // { duration: '1m', target: 15 },
                // { duration: '3m', target: 50 },
                // { duration: '1m', target: 30 },
                // { duration: '1m', target: 15 },
                // { duration: '30s', target: 0 },
                // scénario léger
                { duration: '1m', target: 5 },
                { duration: '2m', target: 10 },
                { duration: '1m', target: 5 },
                { duration: '30s', target: 0 },
            ],
        },
        // Scénario pour les clients - pic de consultation
        client_users: {
            executor: 'ramping-vus',
            exec: 'clientScenario',
            startVUs: 10,
            stages: [
                // { duration: '1m', target: 50 },
                // { duration: '2m', target: 100 },
                // { duration: '3m', target: 150 },
                // { duration: '1m', target: 50 },
                // { duration: '30s', target: 0 },
                // scénario léger
                { duration: '1m', target: 20 },
                { duration: '2m', target: 100 },
                { duration: '1m', target: 10 },
                { duration: '30s', target: 0 },
            ],
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<500'],
        http_req_failed: ['rate<0.05'], // Moins de 5% d'échecs
    },
};

const BASE_URL = 'http://localhost/api';

// Informations de connexion pour chaque type d'utilisateur
const USER_CREDENTIALS = {
    admin: {
        name: 'admin',
        username: 'admin',
        password: 'admin',
        storeId: 4
    },
    // Staff aléatoire sera sélectionné dynamiquement parmi staff1 à staff7
    client: {
        name: 'client',
        username: 'client',
        password: 'client',
        storeId: 2
    }
};

// Fonction pour récupérer les informations d'un staff aléatoire (staff1 à staff7)
function getRandomStaffCredentials() {
    const staffNumber = Math.floor(Math.random() * 7) + 1; // 1 à 7
    return {
        name: `staff${staffNumber}`,
        username: `staff${staffNumber}`,
        password: `staff${staffNumber}`,
        storeId: staffNumber // Chaque staff est associé à son magasin correspondant
    };
}

// Cache pour stocker les tokens une fois récupérés
let USER_TOKENS = {};

// Cache pour stocker les magasins SALES une fois récupérés
let SALES_STORES_CACHE = null;

// Fonction pour récupérer tous les magasins SALES accessibles à un utilisateur
function getAccessibleSalesStores(token) {
    // Si on a déjà en cache, le retourner
    if (SALES_STORES_CACHE && SALES_STORES_CACHE.length > 0) {
        return SALES_STORES_CACHE;
    }

    // Selon le seed, il y a 7 magasins SALES créés (IDs 1 à 7)
    // et le client a accès à tous les magasins SALES
    const salesStores = [];
    for (let i = 1; i <= 7; i++) {
        salesStores.push({
            id: i,
            name: `Store SALES ${i}`,
            type: 'SALES'
        });
    }
    
    // Mettre en cache pour les prochaines utilisations
    SALES_STORES_CACHE = salesStores;
    
    return salesStores;
}

// Fonction pour faire le login et récupérer le token
function getAuthToken(userType, staffCreds = null) {
    let userCreds;
    
    if (userType === 'staff' && staffCreds) {
        userCreds = staffCreds;
    } else {
        userCreds = USER_CREDENTIALS[userType];
    }
    
    // Si on a déjà le token en cache, le retourner
    if (USER_TOKENS[userCreds.username]) {
        return USER_TOKENS[userCreds.username];
    }

    // Sinon, faire le login
    const loginResponse = http.post(`${BASE_URL}/auth/login`, 
        JSON.stringify({
            username: userCreds.username,
            password: userCreds.password
        }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });

    check(loginResponse, {
        [`[${userType.toUpperCase()}] Login successful`]: (r) => r.status === 200,
    });

    if (loginResponse.status === 200) {
        const responseBody = JSON.parse(loginResponse.body);
        const token = responseBody.token;
        
        // Mettre en cache pour les prochaines utilisations
        USER_TOKENS[userCreds.username] = token;
        
        return token;
    } else {
        console.error(`[${userType.toUpperCase()}] Échec du login pour ${userCreds.username}: ${loginResponse.status} - ${loginResponse.body}`);
        return null;
    }
}

// Fonction pour récupérer les produits disponibles dans un magasin
function getAvailableProducts(storeId, token) {
    const stockResponse = http.get(`${BASE_URL}/stock/store/${storeId}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    check(stockResponse, { 'getAvailableProducts': (r) => r.status === 200 });
    if (stockResponse.status === 200) {
        const stockData = JSON.parse(stockResponse.body);
        // Filtrer seulement les produits qui ont du stock > 0
        const availableProducts = stockData.filter(item => item.quantity > 0);
        if (availableProducts.length > 0) {
            return availableProducts;
        } else {
            return [];
        }
    } else {
        
        return [];
    }
}

// Fonction pour sélectionner un produit aléatoire parmi ceux disponibles
function getRandomAvailableProduct(availableProducts) {
    if (availableProducts.length === 0) {
        return null;
    }
    return availableProducts[Math.floor(Math.random() * availableProducts.length)];
}

// Scénario Administrateur
export function adminScenario() {
    const token = getAuthToken('admin');
    if (!token) {
        console.error(`[ADMIN] Impossible de récupérer le token`);
        return;
    }
    
    // Récupérer tous les magasins SALES accessibles (selon le seed: 7 magasins SALES)
    const salesStores = getAccessibleSalesStores(token);

    // Choisir un magasin aléatoire parmi les 7 magasins SALES
    const randomStore = salesStores[Math.floor(Math.random() * salesStores.length)];

    const user = {
        name: 'admin',
        token: token,
        storeId: randomStore.id
    };
    
    // 1. Consultation tableau de bord
    let dashboardRes = http.get(`${BASE_URL}/reports/consolidated?startDate=2025-01-01&endDate=2025-12-31`, {
        headers: { Authorization: `Bearer ${user.token}` },
    });
    check(dashboardRes, { '[Admin] Dashboard loaded': (r) => r.status === 200 });
    
    // 2. Gestion des demandes logistiques
    let logisticsRes = http.get(`${BASE_URL}/logistics/replenishment`, {
        headers: { Authorization: `Bearer ${user.token}` },
    });
    check(logisticsRes, { '[Admin] Logistics requests': (r) => r.status === 200 });
    
    // // 2.1. Approbation d'une demande de réapprovisionnement si disponible
    // if (logisticsRes.status === 200) {
    //     const replenishmentRequests = JSON.parse(logisticsRes.body);
    //     if (replenishmentRequests && replenishmentRequests.length > 0) {
    //         const pendingRequest = replenishmentRequests.filter(req => req.status === 'PENDING');
    //         if (pendingRequest.length > 0) {
    //             const i = Math.floor(Math.random() * pendingRequest.length);
    //             let approvalRes = http.post(`${BASE_URL}/logistics/replenishment/${pendingRequest[i].id}/approve`, {
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                     Authorization: `Bearer ${user.token}`,
    //                 },
    //             });
    //             check(approvalRes, { '[Admin] Replenishment approved': (r) => r.status === 200 });
    //         }
    //     }
    // }
    
    // 3. Mise à jour produits (avec données réelles)
    const availableProducts = getAvailableProducts(user.storeId, user.token);
    if (availableProducts.length > 0) {
        const productToUpdate = getRandomAvailableProduct(availableProducts);
        let productUpdateRes = http.put(`${BASE_URL}/products/store/${user.storeId}/product/${productToUpdate.productId}`, 
            JSON.stringify({
                name: `Admin Updated ${productToUpdate.Product?.name || 'Product'} ${Date.now()}`,
                price: Math.floor(Math.random() * 500) + 100,
                stock: productToUpdate.quantity + Math.floor(Math.random() * 50) + 10 // Augmenter le stock
            }), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        });
        check(productUpdateRes, { '[Admin] Product updated': (r) => r.status === 200 || r.status === 204 });
    } else {
        console.warn('[Admin] Aucun produit disponible pour mise à jour');
    }
    
    sleep(2); // Admins prennent plus de temps pour analyser
}

// Scénario Staff
export function staffScenario() {
    // Sélectionner un staff aléatoire parmi staff1 à staff7
    const staffCreds = getRandomStaffCredentials();
    const token = getAuthToken('staff', staffCreds);
    if (!token) {
        console.error(`[STAFF] Impossible de récupérer le token pour ${staffCreds.username}`);
        return;
    }
    
    const user = {
        name: staffCreds.name,
        token: token,
        storeId: staffCreds.storeId
    };
    
    // 1. Consultation stock magasin
    let stockRes = http.get(`${BASE_URL}/stock/store/${user.storeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
    });
    check(stockRes, { '[Staff] Stock checked': (r) => r.status === 200 });
    
    // const availableProducts = getAvailableProducts(user.storeId, user.token);
    // if (availableProducts.length > 0) {
    //     // 2. Création d'une demande de réapprovisionnement (avec produits réels)
    //     // Sélectionner un produit avec stock faible pour demander réapprovisionnement
    //     const lowStockProducts = availableProducts.filter(product => product.quantity < 50);
    //     const productsToReplenish = lowStockProducts.length > 0 ? lowStockProducts : availableProducts;
        
    //     const product = getRandomAvailableProduct(productsToReplenish);
    //     // Demander entre 50 et 200 unités selon les besoins
    //     const requestedQuantity = Math.floor(Math.random() * 150) + 50;
        
    //     let replenishmentRes = http.post(`${BASE_URL}/logistics/replenishment`, 
    //         JSON.stringify({
    //             storeId: user.storeId,
    //             productId: product.productId,
    //             quantity: requestedQuantity
    //         }), {
    //         headers: {
    //             'Content-Type': 'application/json',
    //             Authorization: `Bearer ${user.token}`,
    //         },
    //     });
    //     check(replenishmentRes, { '[Staff] Replenishment requested': (r) => r.status === 200 || r.status === 201 });
    // } else {
        // 2. Consultation tableau de bord
        let dashboardRes = http.get(`${BASE_URL}/reports/consolidated?startDate=2025-01-01&endDate=2025-12-31`, {
            headers: { Authorization: `Bearer ${user.token}` },
        });
        check(dashboardRes, { '[Staff] Dashboard loaded': (r) => r.status === 200 });
    // }
    
    // 3. Consultation des produits
    let productsRes = http.get(`${BASE_URL}/products/store/${user.storeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
    });
    check(productsRes, { '[Staff] Products viewed': (r) => r.status === 200 });
    
    sleep(1.5); // Rythme de travail normal
}

// Scénario Client
export function clientScenario() {
    const token = getAuthToken('client');
    if (!token) {
        console.error(`[CLIENT] Impossible de récupérer le token`);
        return;
    }
    
    // Récupérer tous les magasins SALES accessibles (selon le seed: 7 magasins SALES)
    const salesStores = getAccessibleSalesStores(token);

    // Choisir un magasin aléatoire parmi les 7 magasins SALES
    const randomStore = salesStores[Math.floor(Math.random() * salesStores.length)];
    const user = {
        name: 'client',
        token: token,
        storeId: randomStore.id
    };
    
    // 1. Navigation produits dans le magasin choisi
    let productsRes = http.get(`${BASE_URL}/products/store/${user.storeId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
    });
    check(productsRes, { '[Client] Products browsed': (r) => r.status === 200 });

    // 2. Recherche un produit par categorie (optionnel)
    let categoryRes = http.get(`${BASE_URL}/products/search/category/Musique`, {
        headers: { Authorization: `Bearer ${user.token}` },
    });
    check(categoryRes, { '[Client] Category products viewed': (r) => r.status === 200 });

    // 3. Achat de produits dans le magasin choisi (vente côté client)
    const availableProducts = getAvailableProducts(user.storeId, user.token);
    if (availableProducts.length > 0) {
        // Le client achète 1-2 produits
        const numItems = Math.min(Math.floor(Math.random() * 2) + 1, availableProducts.length);
        const purchaseItems = [];
        
        for (let i = 0; i < numItems; i++) {
            const product = getRandomAvailableProduct(availableProducts);
            const maxQuantity = Math.min(product.quantity, 3); // Client achète max 3 unités
            const quantity = Math.floor(Math.random() * maxQuantity) + 1;
            
            purchaseItems.push({
                productId: product.productId,
                quantity: quantity
            });
        }
        
        let purchaseRes = http.post(`${BASE_URL}/sales`, 
            JSON.stringify({
                storeId: user.storeId,
                items: purchaseItems
            }), {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${user.token}`,
            },
        });
        check(purchaseRes, { '[Client] Purchase made': (r) => r.status === 200 || r.status === 201 });
    }
    
    sleep(0.8); // Clients naviguent rapidement
}

// Fonction par défaut (utilisée si pas de scénarios spécifiques)
export default function() {
    // Sélection aléatoire d'un utilisateur
    const userTypes = Object.keys(USER_CREDENTIALS);
    const randomUserType = userTypes[Math.floor(Math.random() * userTypes.length)];
    
    switch(randomUserType) {
        case 'admin':
            adminScenario();
            break;
        case 'staff':
            staffScenario();
            break;
        case 'client':
            clientScenario();
            break;
    }
}
