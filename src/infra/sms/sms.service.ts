import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import twilio, { type Twilio } from 'twilio'

@Injectable()
export class SmsService {
	private readonly client: Twilio
	private readonly serviceSid: string

	constructor(configService: ConfigService) {
		const accountSid = configService.getOrThrow<string>('twilio.accountSid')
		const authToken = configService.getOrThrow<string>('twilio.authToken')
		this.serviceSid = configService.getOrThrow<string>('twilio.serviceSid')

		this.client = twilio(accountSid, authToken)
	}

	async sendOtp(phone: string, code: string) {
		await this.client.verify.v2
			.services(this.serviceSid)
			.verifications.create({
				channel: 'sms',
				customCode: code,
				to: phone
			})
	}
}
