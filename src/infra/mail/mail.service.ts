import { MailerService } from '@nestjs-modules/mailer'
import { Injectable } from '@nestjs/common'

import { TemplateService } from './template.service'

@Injectable()
export class MailService {
	constructor(
		private readonly transporter: MailerService,
		private readonly templateService: TemplateService
	) {}

	async sendOtp(email: string, code: string) {
		const html = this.templateService.render('otp', { code })

		await this.transporter.sendMail({
			to: email,
			subject: 'Ваш код підтвердження',
			html
		})
	}

	async sendEmailChange(email: string, code: string) {
		const html = this.templateService.render('email-change', { code })

		await this.transporter.sendMail({
			to: email,
			subject: 'Ваш код підтвердження зміни електронної пошти',
			html
		})
	}
}
