import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import ChangeAddressEvent from "../change-adress.event";

export default class ChangeAddressHandler implements EventHandlerInterface<ChangeAddressEvent> {
  handle(event: ChangeAddressEvent): void {
    console.log(`Endereço do cliente: ${event.eventData.id}, ${event.eventData.nome} alterado para: ${event.eventData.endereco}`)
  }
}