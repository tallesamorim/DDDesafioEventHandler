import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    
    const { orderItem1, orderItem2, product } = await criarOrderItem();

    const order = new Order("123", "123", [orderItem1, orderItem2]);

    const orderRepository = new OrderRepository();

    await orderRepository.create(order);

    const orderItem3 = new OrderItem(
      "3",
      product.name,
      product.price,
      product.id,
      2
    );

    order.addItem(orderItem3);
    await orderRepository.update(order);
    const orderModel = await OrderModel.findOne({ where: { id: "123" },  include: ["items"] });

    expect(orderModel.items.length).toBe(3);
  });

  it("should find a order by id", async () => {
    
    const { orderItem1, orderItem2, product } = await criarOrderItem();

    const order = new Order("123", "123", [orderItem1, orderItem2]);

    const orderRepository = new OrderRepository();

    await orderRepository.create(order);

    const orderResult = await orderRepository.find(order.id);

    expect(orderResult).toStrictEqual(order);

  });

  it("should find all orders", async () => {
      
      const { orderItem1, orderItem2, product } = await criarOrderItem();
  
      const order = new Order("123", "123", [orderItem1, orderItem2]);
  
      const orderRepository = new OrderRepository();
  
      await orderRepository.create(order);
  
      const orderResult = await orderRepository.findAll();
  
      expect(orderResult).toStrictEqual([order]);
  
    });

  it("should throw an error when try to find a order by id and not found", async () => {  
    const orderRepository = new OrderRepository();
    await expect(orderRepository.find("123")).rejects.toThrow();
  });

});

async function criarOrderItem() {
  const customerRepository = new CustomerRepository();
  const customer = new Customer("123", "Customer 1");
  const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
  customer.changeAddress(address);
  await customerRepository.create(customer);

  const productRepository = new ProductRepository();
  const product = new Product("123", "Product 1", 10);
  await productRepository.create(product);

  const orderItem1 = new OrderItem(
    "1",
    product.name,
    product.price,
    product.id,
    2
  );

  const orderItem2 = new OrderItem(
    "2",
    product.name,
    product.price,
    product.id,
    2
  );
  return { orderItem1, orderItem2, product };
}
