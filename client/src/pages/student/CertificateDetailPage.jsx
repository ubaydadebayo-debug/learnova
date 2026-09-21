import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Award, BadgeCheck, Copy, Download, Share2 } from 'lucide-react';
import { useRef, useState } from 'react';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { useFetch } from '../../hooks/useFetch';
import { downloadCertificate, getCertificate } from '../../services/studentService';

function CertificateFrame({ certificate }) {
  const course = certificate.course;
  const date = new Date(certificate.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/40 bg-white p-6 shadow-sm sm:p-10">
      <div className="pointer-events-none absolute inset-3 rounded-xl border border-secondary/40" aria-hidden="true" />
      <div className="relative flex min-h-[340px] flex-col items-center justify-center text-center">
        <Award className="h-12 w-12 text-primary" aria-hidden="true" />
        <p className="mt-4 text-xs font-bold uppercase tracking-[0.3em] text-secondary">Certificate of Completion</p>
        <h1 className="mt-6 text-3xl font-extrabold text-navy sm:text-4xl">
          {certificate.student.firstName} {certificate.student.lastName}
        </h1>
        <p className="mt-4 text-sm text-navy/60">has successfully completed the course</p>
        <h2 className="mt-3 text-2xl font-extrabold text-primary sm:text-3xl">{course.title}</h2>
        <p className="mt-3 text-sm text-navy/50">
          Taught by {course.instructor.firstName} {course.instructor.lastName} · {date}
        </p>
        <div className="mt-8 flex flex-col items-center gap-2 text-xs text-navy/45">
          <p>Certificate No. {certificate.number}</p>
          <p className="font-mono">{certificate.verificationCode}</p>
        </div>
      </div>
    </div>
  );
}

export default function CertificateDetailPage() {
  const { certificateId } = useParams();
  const certificate = useFetch(() => getCertificate(certificateId), [certificateId]);
  const [copied, setCopied] = useState(false);
  const [downloadState, setDownloadState] = useState('idle');
  const [downloadError, setDownloadError] = useState(null);
  const [shareError, setShareError] = useState(null);
  const shareRef = useRef(null);

  if (certificate.loading) {
    return (
      <section className="container-page flex justify-center py-24">
        <Spinner className="border-primary/30 border-t-primary" />
      </section>
    );
  }

  if (certificate.error || !certificate.data) {
    return (
      <section className="container-page py-16 text-center">
        <BadgeCheck className="mx-auto h-10 w-10 text-error/50" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-extrabold">Something went wrong.</h1>
        <p className="mt-2 text-navy/60">{certificate.error?.message}</p>
        <Button variant="outline" className="mt-6" onClick={certificate.refetch}>
          Try Again
        </Button>
      </section>
    );
  }

  const data = certificate.data;

  const handleDownload = async () => {
    try {
      setDownloadState('loading');
      setDownloadError(null);
      const response = await downloadCertificate(certificateId);
      const blob = response.data instanceof Blob ? response.data : new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `learnova-certificate-${data.number.toLowerCase().replace(/[^a-z0-9]/gi, '-')}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setDownloadState('done');
    } catch (err) {
      setDownloadError(err.message);
      setDownloadState('error');
    }
  };

  const verificationUrl = () => `${window.location.origin}/certificates/verify/${data.verificationCode}`;

  const handleCopyVerification = async () => {
    try {
      await navigator.clipboard.writeText(data.verificationCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleShare = async () => {
    const url = verificationUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Learnova Certificate', text: `Verify ${data.student.firstName} ${data.student.lastName}'s certificate for ${data.course.title}`, url });
        return;
      } catch {
        // fall through to fallback
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareError(null);
      shareRef.current?.focus();
    } catch {
      setShareError('Unable to share. Copy the verification link manually.');
    }
  };

  return (
    <section className="container-page py-8">
      <Link to="/student/certificates" className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Certificates
      </Link>

      <div className="mb-8">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-secondary">Achievement</p>
        <h1 className="text-3xl font-extrabold">Your Certificate</h1>
        <p className="mt-2 text-navy/60">Download, share and verify your official course certificate.</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <CertificateFrame certificate={data} />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button onClick={handleDownload} disabled={downloadState === 'loading'}>
            <Download className="h-4 w-4" aria-hidden="true" />
            {downloadState === 'loading' ? 'Preparing…' : 'Download PDF'}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" aria-hidden="true" />
            Share
          </Button>
          <Button variant="ghost" onClick={handleCopyVerification}>
            <Copy className="h-4 w-4" aria-hidden="true" />
            {copied ? 'Verification code copied!' : data.verificationCode}
          </Button>
        </div>

        <div className="mt-8 rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center gap-2 text-sm font-bold">
            <BadgeCheck className="h-4 w-4 text-success" aria-hidden="true" />
            Public verification link
          </div>
          <a
            ref={shareRef}
            tabIndex={0}
            href={verificationUrl()}
            target="_blank"
            rel="noreferrer"
            className="mt-2 block break-all text-sm text-primary hover:underline"
          >
            {verificationUrl()}
          </a>
          {shareError && <p className="mt-2 text-sm text-error">{shareError}</p>}
        </div>

        {downloadError && (
          <p className="mt-4 text-center text-sm text-error">Download failed: {downloadError}</p>
        )}
      </div>
    </section>
  );
}