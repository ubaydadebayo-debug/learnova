import { Award, BadgeCheck, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { listCertificates, verifyCertificate } from '../../services/studentService';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [verification, setVerification] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await listCertificates();
      setCertificates(response.data.certificates ?? []);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleVerify = async (verificationCode) => {
    try {
      const response = await verifyCertificate(verificationCode);
      setVerification(response.data.certificate ?? null);
    } catch (err) {
      setError(err);
    }
  };

  const handleCopy = async (verificationCode) => {
    await navigator.clipboard.writeText(verificationCode);
    setCopiedCode(verificationCode);
  };

  return (
    <section className="container-page py-8">
      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Learning</p>
        <h1 className="text-3xl font-extrabold">Certificates</h1>
        <p className="mt-2 text-navy/60">View and verify the credentials you have earned.</p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-error/30 bg-error/10 p-4 text-sm text-error">
          {error.message}
        </div>
      )}

      {verification && (
        <div className="mb-6 rounded-2xl border border-success/30 bg-success/10 p-5 text-sm text-navy">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-success">Certificate verified</p>
              <p className="mt-1">{verification.student.firstName} {verification.student.lastName} earned {verification.course.title}</p>
            </div>
            <BadgeCheck className="h-5 w-5 text-success" aria-hidden="true" />
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Spinner className="border-primary/30 border-t-primary" />
        </div>
      ) : certificates.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-white p-12 text-center">
          <Award className="mx-auto h-10 w-10 text-primary/50" aria-hidden="true" />
          <h2 className="mt-4 text-xl font-bold">No certificates yet</h2>
          <p className="mt-2 text-navy/60">Complete a course to unlock a verifiable certificate.</p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {certificates.map((certificate) => (
            <div key={certificate.id} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
              <Link to={`/student/certificates/${certificate.id}`} className="block">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-secondary">Course certificate</p>
                    <h2 className="mt-1 text-xl font-bold">{certificate.course.title}</h2>
                  </div>
                  <Award className="h-6 w-6 text-primary" aria-hidden="true" />
                </div>
              </Link>

              <div className="mt-5 space-y-2 text-sm text-navy/60">
                <p><span className="font-semibold text-navy">Certificate #:</span> {certificate.number}</p>
                <p><span className="font-semibold text-navy">Issued:</span> {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                <p><span className="font-semibold text-navy">Verification:</span> {certificate.verificationCode}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link to={`/student/certificates/${certificate.id}`}>
                  <Button size="sm">
                    View certificate
                  </Button>
                </Link>
                <Button size="sm" variant="outline" onClick={() => handleVerify(certificate.verificationCode)}>
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Verify
                </Button>
                <Button size="sm" variant="ghost" onClick={() => handleCopy(certificate.verificationCode)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {copiedCode === certificate.verificationCode ? 'Copied' : 'Copy code'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
