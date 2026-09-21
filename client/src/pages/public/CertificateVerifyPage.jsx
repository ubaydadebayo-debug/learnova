import { useParams } from 'react-router-dom';
import { Award, BadgeCheck, BadgeX, RefreshCw, Search } from 'lucide-react';
import { useFetch } from '../../hooks/useFetch';
import Button from '../../components/common/Button';
import { verifyCertificate } from '../../services/studentService';

function VerifiedCard({ certificate }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-success/30 bg-success/10 p-5 text-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-semibold text-success">Certificate verified</p>
            <p className="mt-1 text-navy">
              This certificate belongs to{' '}
              <span className="font-semibold text-navy">
                {certificate.student.firstName} {certificate.student.lastName}
              </span>{' '}
              and was issued for the course{' '}
              <span className="font-semibold text-navy">{certificate.course.title}</span> taught by{' '}
              {certificate.course.instructor.firstName} {certificate.course.instructor.lastName}.
            </p>
          </div>
          <BadgeCheck className="h-6 w-6 shrink-0 text-success" aria-hidden="true" />
        </div>
      </div>

      <div className="mt-6 flex flex-col items-center rounded-2xl border border-line bg-white p-10 text-center shadow-sm">
        <Award className="h-14 w-14 text-primary" aria-hidden="true" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-secondary">Certificate of Completion</p>
        <h1 className="mt-5 text-3xl font-extrabold text-navy sm:text-4xl">
          {certificate.student.firstName} {certificate.student.lastName}
        </h1>
        <p className="mt-4 text-sm text-navy/60">has successfully completed the course</p>
        <h2 className="mt-3 text-2xl font-extrabold text-primary sm:text-3xl">{certificate.course.title}</h2>
        <div className="mt-8 flex flex-col items-center gap-1.5 text-xs text-navy/45">
          <p>Certificate No. {certificate.number}</p>
          <p>
            Issued {new Date(certificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CertificateVerifyPage() {
  const { verificationCode } = useParams();
  const result = useFetch(() => verifyCertificate(verificationCode), [verificationCode]);

  return (
    <section className="container-page py-14">
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Learnova</p>
        <h1 className="text-3xl font-extrabold">Certificate Verification</h1>
        <p className="mt-2 text-navy/60">
          Verify the authenticity of a Learnova certificate using its verification code.
        </p>
      </div>

      {result.loading && (
        <div className="flex justify-center py-16" role="status" aria-label="Verifying certificate">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-primary/30 border-t-primary" aria-hidden="true" />
        </div>
      )}

      {result.error && (
        <div className="mx-auto max-w-2xl rounded-2xl border border-error/30 bg-error/10 p-10 text-center">
          <BadgeX className="mx-auto h-12 w-12 text-error" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-extrabold">Certificate not found</h2>
          <p className="mt-2 text-navy/60">
            We couldn't verify a certificate with the code{' '}
            <span className="font-mono font-semibold text-navy">{verificationCode}</span>. Double-check the code and try
            again.
          </p>
          <Button variant="outline" className="mt-6" onClick={result.refetch}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </Button>
        </div>
      )}

      {result.data?.certificate && !result.loading && !result.error && (
        <VerifiedCard certificate={result.data.certificate} />
      )}
    </section>
  );
}