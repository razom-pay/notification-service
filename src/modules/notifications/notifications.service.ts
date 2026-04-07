import { Injectable } from '@nestjs/common'
import type {
	EmailChangeEvent,
	OtpRequestedEvent,
	PhoneChangeEvent
} from '@razom-pay/contracts'

import { MailService } from '../../infra/mail/mail.service'
import { SmsService } from '../../infra/sms/sms.service'

@Injectable()
export class NotificationsService {
	constructor(
		private readonly mailService: MailService,
		private readonly smsService: SmsService
	) {}

	async sendOtp(data: OtpRequestedEvent) {
		const { identifier, code, type } = data
		if (type === 'email') {
			await this.mailService.sendOtp(identifier, code)
			return
		}

		if (type === 'phone') {
			await this.smsService.sendOtp(identifier, code)
			return
		}

		throw new Error(`Unsupported OTP channel: ${type}`)
	}

	async sendPhoneChange(data: PhoneChangeEvent) {
		const { phone, code } = data
		await this.smsService.sendOtp(phone, code)
	}

	async sendEmailChange(data: EmailChangeEvent) {
		const { email, code } = data
		await this.mailService.sendEmailChange(email, code)
	}
}
