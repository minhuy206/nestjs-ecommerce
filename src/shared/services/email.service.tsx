import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import OTPEmail from 'emails/OTPEmail'
import * as React from 'react';

@Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY)
  }

  sendOTP(payload: { email: string; code: string }) {
    
    return this.resend.emails.send({
      from: `${envConfig.ADMIN_EMAIL} <${envConfig.ADMIN_EMAIL}>`,
      to: [payload.email],
      subject: 'Please verify your email before using our services!',
      react: <OTPEmail code={payload.code}  />,
    })
  }
}

