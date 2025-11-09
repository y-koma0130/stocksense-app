'use client'

import { useState } from 'react'
import { css } from '../../../styled-system/css'

export default function LoginPage() {
  const [email, setEmail] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Login with:', email)
    // TODO: Implement Supabase authentication
  }

  return (
    <div className={containerStyle}>
      <div className={cardStyle}>
        <div className={headerStyle}>
          <h1 className={titleStyle}>StockSense</h1>
          <p className={subtitleStyle}>AIが見つける、買い時の銘柄</p>
        </div>

        <form onSubmit={handleLogin} className={formStyle}>
          <div className={inputGroupStyle}>
            <label htmlFor="email" className={labelStyle}>
              メールアドレス
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              className={inputStyle}
            />
          </div>

          <button type="submit" className={buttonStyle}>
            ログイン
          </button>
        </form>
      </div>
    </div>
  )
}

const containerStyle = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '100vh',
  backgroundColor: '#434343',
  padding: '1rem',
})

const cardStyle = css({
  backgroundColor: '#2E2E2E',
  borderRadius: '12px',
  padding: '2.5rem',
  width: '100%',
  maxWidth: '420px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
})

const headerStyle = css({
  textAlign: 'center',
  marginBottom: '2rem',
})

const titleStyle = css({
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#E9F355',
  marginBottom: '0.5rem',
})

const subtitleStyle = css({
  fontSize: '0.95rem',
  color: '#E5E5E5',
  opacity: 0.8,
})

const formStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
})

const inputGroupStyle = css({
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
})

const labelStyle = css({
  fontSize: '0.875rem',
  fontWeight: '500',
  color: '#E5E5E5',
})

const inputStyle = css({
  padding: '0.75rem 1rem',
  backgroundColor: '#434343',
  border: '1px solid #555',
  borderRadius: '6px',
  color: '#E5E5E5',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.2s',
  _placeholder: {
    color: '#999',
  },
  _focus: {
    borderColor: '#E9F355',
  },
})

const buttonStyle = css({
  padding: '0.875rem',
  backgroundColor: '#E9F355',
  color: '#2E2E2E',
  fontSize: '1rem',
  fontWeight: '600',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  _hover: {
    backgroundColor: '#F5FF7A',
    transform: 'translateY(-1px)',
  },
  _active: {
    transform: 'translateY(0)',
  },
})
