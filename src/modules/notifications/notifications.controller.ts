import { Controller, Logger } from '@nestjs/common'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import type {
	EmailChangeEvent,
	OtpRequestedEvent,
	PhoneChangeEvent
} from '@razom-pay/contracts'
import { InjectMetric } from '@willsoto/nestjs-prometheus'
import { Counter, Histogram } from 'prom-client'

import { RmqService } from '../../infra/rmq/rmq.service'

import { NotificationsService } from './notifications.service'

// TODO: ref: make global interceptor
@Controller()
export class NotificationsController {
	private readonly SERVICE_ANME: string

	private readonly logger = new Logger(NotificationsController.name)

	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly rmqService: RmqService,
		@InjectMetric('rmq_event_processing_duration_seconds')
		private readonly processingDuration: Histogram<string>,
		@InjectMetric('rmq_events_total')
		private readonly eventsTotal: Counter<string>
	) {
		this.SERVICE_ANME = 'notification-servixe'
	}

	@EventPattern('auth.otp.requested')
	async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: RmqContext
	) {
		const event = 'auth.otp.requested'

		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_ANME,
			event
		})

		try {
			await this.notificationsService.sendOtp(data)

			this.eventsTotal.inc({
				service: this.SERVICE_ANME,
				event,
				status: 'success'
			})

			this.rmqService.ack(ctx, event)
		} catch (error) {
			this.eventsTotal.inc({
				service: this.SERVICE_ANME,
				event,
				status: 'error'
			})

			if (error instanceof Error) {
				this.logger.error(
					'Error processing OTP request event:',
					error.message ?? error
				)
			}

			this.rmqService.nack(ctx, event)

			throw error
		} finally {
			endTimer()
		}
	}

	@EventPattern('account.phone.change')
	async phoneChange(
		@Payload() data: PhoneChangeEvent,
		@Ctx() ctx: RmqContext
	) {
		const event = 'account.phone.change'

		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_ANME,
			event
		})

		try {
			await this.notificationsService.sendPhoneChange(data)

			this.eventsTotal.inc({
				service: this.SERVICE_ANME,
				event,
				status: 'success'
			})

			this.rmqService.ack(ctx, event)
		} catch (error) {
			this.eventsTotal.inc({
				service: this.SERVICE_ANME,
				event,
				status: 'error'
			})

			if (error instanceof Error) {
				this.logger.error(
					'Error processing phone changed event:',
					error.message ?? error
				)
			}

			this.rmqService.nack(ctx, event)
		} finally {
			endTimer()
		}
	}

	@EventPattern('account.email.change')
	async emailChange(
		@Payload() data: EmailChangeEvent,
		@Ctx() ctx: RmqContext
	) {
		const event = 'account.email.change'

		const endTimer = this.processingDuration.startTimer({
			service: this.SERVICE_ANME,
			event
		})

		try {
			await this.notificationsService.sendEmailChange(data)

			this.rmqService.ack(ctx, event)
		} catch (error) {
			if (error instanceof Error) {
				this.logger.error(
					'Error processing email changed event:',
					error.message ?? error
				)

				this.rmqService.nack(ctx, event)
			}
		} finally {
			endTimer()
		}
	}
}
