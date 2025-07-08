'use client';

import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import InputWithCopyButton from '@/components/shared/InputWithCopyButton';
import { Loading, Error } from '@/components/shared';
import env from '@/lib/env';

interface SAMLConfig {
  acsUrl: string;
  entityId: string;
  response: string;
  assertionSignature: string;
  signatureAlgorithm: string;
}

export default function SPConfig() {
  const [config, setConfig] = useState<SAMLConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (env.jackson.selfHosted) {
      window.location.href = `${env.jackson.externalUrl}/.well-known/saml-configuration`;
      return;
    }

    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/well-known/saml-configuration');
        if (response.ok) {
          const data = await response.json();
          setConfig(data.config);
        } else {
          setError('Failed to fetch SAML configuration');
        }
      } catch (err) {
        setError('Failed to fetch SAML configuration');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  if (env.jackson.selfHosted) {
    return null;
  }

  if (loading) {
    return <Loading />;
  }

  if (error || !config) {
    return <Error message={error || 'SAML configuration not found'} />;
  }

  return (
    <div className="mt-10 flex w-full justify-center px-5">
      <div className="w-full rounded border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800 md:w-1/2">
        <div className="flex flex-col space-y-3">
          <h2 className="font-bold text-gray-700 md:text-xl">
            Service Provider SAML Configuration
          </h2>
          <p className="text-sm leading-6 text-gray-800">
            Use the following configuration to set up SAML SSO with your
            identity provider.
          </p>
          <p className="text-sm leading-6 text-gray-600">
            Refer to our{' '}
            <a
              href="https://boxyhq.com/docs/jackson/sso-providers"
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-4"
            >
              guides
            </a>{' '}
            for provider-specific instructions.
          </p>
        </div>
        <div className="mt-6 flex flex-col gap-6">
          <div className="form-control w-full">
            <InputWithCopyButton
              value={config.acsUrl}
              label="ACS (Assertion Consumer Service) URL"
            />
          </div>
          <div className="form-control w-full">
            <InputWithCopyButton value={config.entityId} label="SP Entity ID" />
          </div>
          <div className="form-control w-full">
            <div className="flex flex-col">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                Response
              </label>
              <p className="text-sm">{config.response}</p>
            </div>
          </div>
          <div className="form-control w-full">
            <div className="flex flex-col">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                Assertion Signature
              </label>
              <p className="text-sm">{config.assertionSignature}</p>
            </div>
          </div>
          <div className="form-control w-full">
            <div className="flex flex-col">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                Signature Algorithm
              </label>
              <p className="text-sm">{config.signatureAlgorithm}</p>
            </div>
          </div>
          <div className="form-control w-full">
            <div className="flex flex-col">
              <label className="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-300">
                Assertion Encryption
              </label>
              <p className="text-sm">
                To encrypt assertions,{' '}
                <Link
                  href="/.well-known/saml.cer"
                  className="underline underline-offset-4"
                  target="_blank"
                >
                  download
                </Link>{' '}
                our public certificate.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
