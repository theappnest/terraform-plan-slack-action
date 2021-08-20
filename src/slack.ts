import { MessageAttachment } from '@slack/types'
import { IncomingWebhook } from '@slack/webhook'

export async function postMessage(
  url: string,
  channel: string,
  fields: MessageAttachment['fields'],
): Promise<void> {
  const webhook = new IncomingWebhook(url, {
    text: 'Detected changes to infrastructure:',
    channel,
  })

  await webhook.send({ attachments: [{ fields }] })
}
