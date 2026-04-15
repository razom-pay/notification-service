// TODO: fix errors
import { Injectable, Logger } from '@nestjs/common'
import { RmqContext } from '@nestjs/microservices'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Counter } from 'prom-client'

@Injectable()
export class RmqService {
	private readonly SERVICE_NAME: string

	private readonly logger = new Logger(RmqService.name)

	constructor(
		@InjectMetric('rmq_events_ack_total')
		private readonly ackTotal: Counter<string>,
		@InjectMetric('rmq_events_nack_total')
		private readonly nackTotal: Counter<string>
	) {
		this.SERVICE_NAME = 'notification-service'
	}

	ack(context: RmqContext, event: string) {
		const channel = context.getChannelRef()
		const msg = context.getMessage()

		const tag = msg?.fields?.deliveryTag

		if (!tag) return

		channel.ack(msg)

		this.ackTotal.inc({
			service: this.SERVICE_NAME,
			event
		})

		this.logger.debug(`ACK (pattern: ${context.getPattern()}, tag: ${tag})`)
	}

	nack(context: RmqContext, event: string, requeue = false) {
		const channel = context.getChannelRef()
		const msg = context.getMessage()

		const tag = msg?.fields?.deliveryTag

		if (!tag) return

		channel.nack(msg, false, requeue)

		this.nackTotal.inc({
			service: this.SERVICE_NAME,
			event
		})

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
