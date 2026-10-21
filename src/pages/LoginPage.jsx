import Icon from '../icons'
import { Badge, Logo } from '../components/ui'

export default function LoginPage({ role, setRole, onSignIn }) {
  return (
    <div className="login-page">
      <div className="login-story">
        <Logo />
        <div>
          <span className="eyebrow">ROOM FOR YOUR BEST WORK</span>
          <h1>
            All your files.
            <br />
            One shared space.
          </h1>
          <p>
            Store the important things. Keep your team connected.
            <br />
            Make room for what’s next.
          </p>
          <div className="login-art">
            <Icon name="folder" size={125} />
            <span>
              <Icon name="shield" size={35} />
            </span>
          </div>
        </div>
        <small>Cloud Storage & File Sharing System · University project</small>
      </div>
      <div className="login-form">
        <div className="login-card">
          <Badge>FRONTEND DEMO</Badge>
          <h2>Welcome back</h2>
          <p>Sign in to your company workspace.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              onSignIn(true)
            }}
          >
            <label>
              Email or username
              <input
                required
                placeholder="you@company.com"
                autoComplete="username"
              />
            </label>
            <label>
              Password
              <input
                required
                type="password"
                minLength={4}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </label>
            <label>
              Sign in as
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option>Employee</option>
                <option>Admin</option>
              </select>
            </label>
            <button className="btn primary full">
              Sign in <Icon name="arrow" size={17} />
            </button>
          </form>
          <div className="divider">or explore the mockup</div>
          <button
            className="btn full"
            onClick={() => {
              onSignIn(false)
            }}
          >
            Continue with demo account
          </button>
          <p className="form-note">
            Demo only. No authentication service is connected. Use any sample
            credentials; passwords are never saved.
          </p>
        </div>
      </div>
    </div>
  )
}
