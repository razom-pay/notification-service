import { Controller } from '@nestjs/common'
import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices'
import type {
	EmailChangeEvent,
	OtpRequestedEvent,
	PhoneChangeEvent
} from '@razom-pay/contracts'

import { RmqService } from '../../infra/rmq/rmq.service'

import { NotificationsService } from './notifications.service'

@Controller()
export class NotificationsController {
	constructor(
		private readonly notificationsService: NotificationsService,
		private readonly rmqService: RmqService
	) {}

	@EventPattern('auth.otp.requested')
	async otpRequested(
		@Payload() data: OtpRequestedEvent,
		@Ctx() ctx: RmqContext
	) {
		try {
			await this.notificationsService.sendOtp(data)

			this.rmqService.ack(ctx)
		} catch (error) {
			if (error instanceof Error) {
				console.error(
					'Error processing OTP request event:',
					error.message ?? error
				)

				this.rmqService.nack(ctx)
			}
		}
	}

	@EventPattern('account.phone.change')
	async phoneChange(
		@Payload() data: PhoneChangeEvent,
		@Ctx() ctx: RmqContext
	) {
		try {
			await this.notificationsService.sendPhoneChange(data)

			this.rmqService.ack(ctx)
		} catch (error) {
			if (error instanceof Error) {
				console.error(
					'Error processing phone changed event:',
					error.message ?? error
				)

				this.rmqService.nack(ctx)
			}
		}
	}

	@EventPattern('account.email.change')
	async emailChange(
		@Payload() data: EmailChangeEvent,
		@Ctx() ctx: RmqContext
	) {
		try {
			await this.notificationsService.sendEmailChange(data)

			this.rmqService.ack(ctx)
		} catch (error) {
			if (error instanceof Error) {
				console.error(
					'Error processing email changed event:',
					error.message ?? error
				)

				this.rmqService.nack(ctx)
			}
		}
	}
}
