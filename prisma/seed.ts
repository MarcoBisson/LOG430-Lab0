import { PrismaClient, StoreType, User, UserRole } from '@prisma/client'
import * as bcrypt from 'bcryptjs';
import { randomInt } from 'crypto';
const prisma = new PrismaClient()

async function main() {

    // create stores
    const stores: any[]  = []
    for (let i = 1; i <= 5; i++) {
        if (i <= 3){
            stores.push({
                name: `Product ${i}`,
                type:  StoreType.SALES,
                address: `10${i}9 rue notre dame ouest`,
            });
        } else if (i == 4) {
            stores.push({
                name: `Product ${i}`,
                type:  StoreType.LOGISTICS,
                address: `10${i}9 rue notre dame ouest`,
            });
        } else {
            stores.push({
                name: `Product ${i}`,
                type:  StoreType.HEADQUARTERS,
                address: `10${i}9 rue notre dame ouest`,
            });
        }

      };

    await prisma.store.createMany({
        data:stores,
    });

    // create products
    const products: any[]= []
    for (let i = 1; i <= 20; i++) {
        products.push({
            name: `Test Product ${i}`,
            price: randomInt(10, 100),
        });
    };
    await prisma.product.createMany({
        data:products,
    });

    // create link between product and store
    const storeStocks: any[] = []

    const storeIds = await prisma.store.findMany({
        select: {
            id: true,
            type: true
        }
    });

    const productIds = await prisma.product.findMany({
        select: {
            id: true,
            price:true
        }
    });

    const saleStore = storeIds.filter( store => store.type == StoreType.SALES)
    const logisticStore = storeIds.filter( store => store.type == StoreType.LOGISTICS)[0]

    productIds.forEach( ob => {
        
        storeStocks.push({
            storeId: saleStore[randomInt(saleStore.length)].id,
            productId: ob.id,
            quantity: randomInt(1, 100)
        });

        storeStocks.push({
            storeId: logisticStore.id,
            productId: ob.id,
            quantity: randomInt(200, 400)
        })
    });

    await prisma.storeStock.createMany({
        data:storeStocks,
    });
    

    //create link between sale and store
    const sales: any[] = [];
    const startTime = new Date('2025-01-01');
    const endTime = new Date();

    for (let i = 0; i < 100; i++){
        const randomTime = startTime.getTime() + Math.random() * (endTime.getTime() - startTime.getTime());

        sales.push(
            {
                date: new Date(randomTime),
                storeId: saleStore[randomInt(saleStore.length)].id,
            }
        )

    }

    await prisma.sale.createMany({
        data:sales,
    });

    // create link between sale and saleItem
    const saleIds = await prisma.sale.findMany({select:{
        id:true,
    }});
    
    const saleItems: any[] = [];

    saleIds.forEach( ob => {
        const product = productIds[randomInt(productIds.length)];
        saleItems.push({
        saleId: ob.id,
        productId: product.id,
        quantity: randomInt(1, 10),
        unitPrice: product.price
    })});

    await prisma.saleItem.createMany({
        data: saleItems
    })

    // create user 
    const users = [
        {
            username: 'admin',
            password: await bcrypt.hash('admin', 10),
            role: UserRole.ADMIN,
            access: {
                connect: storeIds.map(store => ({ id: store.id })),
            },
        },
        {
            username: 'client',
            password: await bcrypt.hash('client', 10),
            role: UserRole.CLIENT,
            access: {
                connect: storeIds.map(store => ({ id: store.id })),
            },
        },
        {
            username: 'staff2',
            password: await bcrypt.hash('client2', 10),
            role: UserRole.CLIENT,
            access: {
                connect: [{id: storeIds[1].id}],
            },
        },
        {
            username: 'staff3',
            password: await bcrypt.hash('client3', 10),
            role: UserRole.CLIENT,
            access: {
                connect: [{id: storeIds[2].id}],
            },
        },
        {
            username: 'staff',
            password: await bcrypt.hash('staff', 10),
            role: UserRole.STAFF,
            access: {
                connect: [{id: storeIds[0].id}],
            },
        },
        {
            username: 'logistic',
            password: await bcrypt.hash('logistic', 10),
            role: UserRole.LOGISTICS,
            access: {
                connect: [{id: storeIds[3].id}],
            },
        },
    ]
    await Promise.all(users.map(user => prisma.user.create({ data: user })));  
}

main()
  .then(() => prisma.$disconnect())
  .catch(e => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })