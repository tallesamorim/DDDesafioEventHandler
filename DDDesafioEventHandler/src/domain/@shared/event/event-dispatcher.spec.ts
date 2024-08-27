import Customer from "../../customer/entity/customer";
import ChangeAddressEvent from "../../customer/event/change-adress.event";
import CustomerCreatedEvent from "../../customer/event/customer-created.event";
import ChangeAddressHandler from "../../customer/event/handler/change-address.handler";
import CriarCustomerHandler from "../../customer/event/handler/criar-customer.handler";
import CriarCustomerHandler2 from "../../customer/event/handler/criar-customer2.handler";
import Address from "../../customer/value-object/address";
import SendEmailWhenProductIsCreatedHandler from "../../product/event/handler/send-email-when-product-is-created.handler";
import ProductCreatedEvent from "../../product/event/product-created.event";
import EventDispatcher from "./event-dispatcher";

describe("Domain events tests", () => {
  it("should register an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      1
    );
    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);
  });

  it("should unregister an event handler", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregister("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeDefined();
    expect(eventDispatcher.getEventHandlers["ProductCreatedEvent"].length).toBe(
      0
    );
  });

  it("should unregister all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    eventDispatcher.unregisterAll();

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"]
    ).toBeUndefined();
  });

  it("should notify all event handlers", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new SendEmailWhenProductIsCreatedHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ProductCreatedEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ProductCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const productCreatedEvent = new ProductCreatedEvent({
      name: "Product 1",
      description: "Product 1 description",
      price: 10.0,
    });

    // Quando o notify for executado o SendEmailWhenProductIsCreatedHandler.handle() deve ser chamado
    eventDispatcher.notify(productCreatedEvent);

    expect(spyEventHandler).toHaveBeenCalled();
  });

  it("should notify all event handlers for when to create a new client", () => {
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new CriarCustomerHandler();
    const eventHandler2 = new CriarCustomerHandler2();
    
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("CustomerCreatedEvent", eventHandler);
    eventDispatcher.register("CustomerCreatedEvent", eventHandler2);

    expect(
      eventDispatcher.getEventHandlers["CustomerCreatedEvent"][0]
    ).toMatchObject(eventHandler);

    const customerCreatedEvent = new CustomerCreatedEvent({
      id: "1",
      nome: "Customer 1",
      endereco: "Customer 1 address",
    });

    // Quando o notify for executado o CriarCustomerHandler.handle() deve ser chamado
    eventDispatcher.notify(customerCreatedEvent);
    
    expect(spyEventHandler).toHaveBeenCalled();

  });

  it("should notify all event handlers for when to change client address", () => {
  
    const eventDispatcher = new EventDispatcher();
    const eventHandler = new ChangeAddressHandler();
    const spyEventHandler = jest.spyOn(eventHandler, "handle");

    eventDispatcher.register("ChangeAddressEvent", eventHandler);

    expect(
      eventDispatcher.getEventHandlers["ChangeAddressEvent"][0]
    ).toMatchObject(eventHandler);


    const customer = new Customer('1', 'João Paulo');
    const address = new Address('Rua Abel Justino de Macedo', 123, '9.9999-9999', 'Sanka');
    customer.changeAddress(address);


    const changeAddressEvent = new ChangeAddressEvent({
      id: customer.id,
      nome: customer.name,
      endereco: customer.Address.street,
    });

    // Quando o notify for executado o ChangeAddressHandler.handle() deve ser chamado
    eventDispatcher.notify(changeAddressEvent);

    expect(spyEventHandler).toHaveBeenCalled();

  });

});
