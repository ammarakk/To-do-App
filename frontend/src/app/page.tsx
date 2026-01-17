import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 animate-in fade-in duration-1000">
      <div className="max-w-6xl w-full space-y-12 sm:space-y-16">
        {/* Hero Section */}
        <div className="text-center space-y-4 sm:space-y-6">
          {/* Animated glow effect behind title */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-3/4 sm:w-2/3 h-24 sm:h-32 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
            </div>
            <h1 className="relative text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-500 bg-clip-text text-transparent animate-pulse-slow">
                Quantum Tasks
              </span>
            </h1>
          </div>

          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            Organize your life with the power of{' '}
            <span className="text-cyan-300 font-semibold">intelligent</span> task{' '}
            <span className="text-fuchsia-300 font-semibold">management</span>
          </p>

          <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-2xl mx-auto px-4">
            Experience the future of productivity with a task system designed for clarity, speed, and focus.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12" style={{ contentVisibility: 'auto' }}>
          <Card
            variant="primary"
            className="group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 border border-cyan-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-100 group-hover:text-cyan-400 transition-colors">
              Smart Task Management
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Create, organize, and track your tasks with an intuitive interface designed for flow state productivity.
            </p>
          </Card>

          <Card
            variant="secondary"
            className="group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-fuchsia-600/20 border border-fuchsia-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(255,0,255,0.8)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-100 group-hover:text-fuchsia-400 transition-colors">
              Enterprise Security
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Your data is protected with bank-grade encryption and secure authentication protocols.
            </p>
          </Card>

          <Card
            variant="accent"
            className="group"
          >
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg
                className="w-7 h-7 text-blue-400 drop-shadow-[0_0_8px_rgba(0,127,255,0.8)]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mb-3 text-gray-100 group-hover:text-blue-400 transition-colors">
              Lightning Performance
            </h3>
            <p className="text-gray-400 leading-relaxed">
              Built for speed with cutting-edge technology that keeps up with your busiest days.
            </p>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center space-y-6 sm:space-y-8 px-4">
          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            Start organizing your life with intelligent task management
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full">
            <Button
              href="/login"
              variant="primary"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto min-h-[44px]"
            >
              Sign In
            </Button>
            <Button
              href="/signup"
              variant="secondary"
              size="lg"
              className="text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 w-full sm:w-auto min-h-[44px]"
            >
              Create Account
            </Button>
          </div>
        </div>

        {/* Trust indicators */}
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-8 text-xs sm:text-sm text-gray-600 px-4">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-cyan-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Free to use</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-fuchsia-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>Instant access</span>
          </div>
        </div>
      </div>
    </main>
  );
}
