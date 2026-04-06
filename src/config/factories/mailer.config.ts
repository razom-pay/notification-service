import { ConfigService } from '@nestjs/config'

export function getMailerConfig(configService: ConfigService) {
	return {
		transport: {
			host: configService.get<string>('smtp.host'),
			port: configService.get<number>('smtp.port'),
			auth: {
				user: configService.get<string>('smtp.user'),
				pass: configService.get<string>('smtp.password')
			},
			secure: configService.get<boolean>('smtp.secure')
		},
		defaults: {
			from: `Razom Pay ${configService.get<string>('smtp.fromAddress')}`
		}
	}
}
