import { WebhookVerifier } from '../WebhookVerifier';
import { ConfigurationError } from '../ConfigurationError';
import { UnauthorizedException } from '@nestjs/common';

describe('WebhookVerifier', () => {
  let verifier: WebhookVerifier;

  beforeEach(() => {
    verifier = new WebhookVerifier();
    // Clear env vars between tests
    delete process.env.XENDIT_CALLBACK_TOKEN;
    delete process.env.XENDIT_WEBHOOK_SECRET;
  });

  describe('verifyCallbackToken', () => {
    it('should throw ConfigurationError when XENDIT_CALLBACK_TOKEN is not set', () => {
      expect(() => verifier.verifyCallbackToken('some-token')).toThrow(ConfigurationError);
      expect(() => verifier.verifyCallbackToken('some-token')).toThrow(/XENDIT_CALLBACK_TOKEN/);
    });

    it('should throw UnauthorizedException when token does not match', () => {
      process.env.XENDIT_CALLBACK_TOKEN = 'correct-secret-token-value';

      expect(() => verifier.verifyCallbackToken('wrong-token')).toThrow(UnauthorizedException);
      expect(() => verifier.verifyCallbackToken('wrong-token')).toThrow('Invalid webhook signature');
    });

    it('should pass silently when token matches', () => {
      process.env.XENDIT_CALLBACK_TOKEN = 'correct-secret-token-value';

      expect(() => verifier.verifyCallbackToken('correct-secret-token-value')).not.toThrow();
    });
  });

  describe('verifyHmacSignature', () => {
    it('should throw ConfigurationError when XENDIT_WEBHOOK_SECRET is not set', () => {
      expect(() => verifier.verifyHmacSignature('body', 'sig')).toThrow(ConfigurationError);
      expect(() => verifier.verifyHmacSignature('body', 'sig')).toThrow(/XENDIT_WEBHOOK_SECRET/);
    });

    it('should throw UnauthorizedException when signature header is missing', () => {
      process.env.XENDIT_WEBHOOK_SECRET = 'whsec_a_very_long_secret_key_for_testing';

      expect(() => verifier.verifyHmacSignature('body', undefined)).toThrow(UnauthorizedException);
    });
  });
});
