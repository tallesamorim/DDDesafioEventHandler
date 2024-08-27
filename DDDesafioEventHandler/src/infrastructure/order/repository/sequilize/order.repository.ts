import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
    async create(entity: Order): Promise<void> {
        await OrderModel.create(
            {
                id: entity.id,
                customer_id: entity.customerId,
                total: entity.total(),
                items: entity.items.map(item => ({
                    id: item.id,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    product_id: item.productId
                }
                )),
            },
            {
                include: [{ model: OrderItemModel }]
            })
    }
    async update(entity: Order): Promise<void> {
        const productFound = await OrderModel.findOne({
            where: {
                id: entity.id
            }
        });
        if (!productFound) {
            throw new Error("Order not found");
        }

        const sequelize = OrderModel.sequelize;
        await sequelize.transaction(async (t) => {
            await OrderItemModel.destroy({
                where: { order_id: entity.id },
                transaction: t,
            });
            const items = entity.items.map((item) => ({
                id: item.id,
                name: item.name,
                price: item.price,
                product_id: item.productId,
                quantity: item.quantity,
                order_id: entity.id,
            }));

            OrderItemModel.bulkCreate(items, { transaction: t });
            await OrderModel.update(
                {
                    customer_id: entity.customerId,
                    total: entity.total()
                },
                { where: { id: entity.id }, transaction: t }
            );
        });
    }
    async find(id: string): Promise<Order> {
        try {
            const order = await OrderModel.findOne({
                where: {
                    id
                },
                include: [{ model: OrderItemModel }]
            })

            const orderItems = order.items.map(item => new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity
            ))

            return new Order(order.id, order.customer_id, orderItems);

        }
        catch (e) {
            throw new Error("Order is required");
        }
    }
    async findAll(): Promise<Order[]> {
        const orders = await OrderModel.findAll({
            include: [{ model: OrderItemModel }]
        })

        return orders.map(order => {
            const orderItems = order.items.map(item => new OrderItem(
                item.id,
                item.name,
                item.price,
                item.product_id,
                item.quantity
            ))

            return new Order(order.id, order.customer_id, orderItems);
        })
    }

}