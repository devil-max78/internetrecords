import { createRoute, Link } from '@tanstack/react-router';
import { rootRoute } from './root';

export const agreementRequestRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/agreement-request',
  component: AgreementRequestComponent,
});

function AgreementRequestComponent() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Request New Label Partnership</h1>
      
      {/* Manual Request Notice */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-100 to-purple-100 mb-6">
            <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            🚀 Coming Soon!
          </h2>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our automated label partnership request system is currently under development. 
            In the meantime, we are entertaining only manual requests.
          </p>
          
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-lg p-6 mb-6">
            <p className="text-gray-700 mb-3">
              To request your custom sublabel, please email us at:
            </p>
            <a 
              href="mailto:support@internetrecords.tech"
              className="inline-flex items-center text-xl font-semibold text-indigo-600 hover:text-indigo-800 transition"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              support@internetrecords.tech
            </a>
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            <p className="mb-2">Please include in your email:</p>
            <ul className="list-disc list-inside text-left max-w-xs mx-auto">
              <li>Your artist/label name</li>
              <li>Your legal name</li>
              <li>Contact number</li>
              <li>Full address</li>
            </ul>
          </div>
          
          <Link
            to="/dashboard"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition"
          >
            <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
