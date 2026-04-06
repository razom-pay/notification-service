import { Injectable } from '@nestjs/common'
import type { OtpRequestedEvent } from '@razom-pay/contracts'

import { MailService } from '../../infra/mail/mail.service'

@Injectable()
export class NotificationsService {
	constructor(private readonly mailService: MailService) {}

	async sendOtp(data: OtpRequestedEvent) {
		const { identifier, code, type } = data
		if (type === 'email') {
			await this.mailService.sendOtp(identifier, code)
		}
	}
}
