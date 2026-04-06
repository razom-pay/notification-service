// TODO: fix errors
import { Injectable, Logger } from '@nestjs/common'
import { RmqContext } from '@nestjs/microservices'

@Injectable()
export class RmqService {
	private readonly logger = new Logger(RmqService.name)
	ack(context: RmqContext) {
		const channel = context.getChannelRef()
		const msg = context.getMessage()

		const tag = msg?.fields?.deliveryTag

		if (!tag) return

		channel.ack(msg)

		this.logger.debug(`ACK (pattern: ${context.getPattern()}, tag: ${tag})`)
	}

	nack(context: RmqContext, requeue = false) {
		const channel = context.getChannelRef()
		const msg = context.getMessage()

		const tag = msg?.fields?.deliveryTag

		if (!tag) return

		channel.nack(msg, false, requeue)

		if (requeue) {
			this.logger.debug(
				`NACK response (pattern: ${context.getPattern()}, tag: ${tag}, requeue: ${requeue})`
			)
		} else {
			this.logger.debug(
				`NACK drop (pattern: ${context.getPattern()}, tag: ${tag}, requeue: ${requeue})`
			)
		}
	}
}
