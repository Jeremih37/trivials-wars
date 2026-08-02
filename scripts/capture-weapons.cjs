// Capture screenshots of all 10 weapons rendered on a test page
const { execSync } = require("child_process")

async function main() {
  // Open the deployed site
  execSync('agent-browser open https://trivials-wars.vercel.app/', { stdio: 'inherit' })
  execSync('agent-browser set viewport 1280 900', { stdio: 'inherit' })
  
  // Wait for login
  await new Promise(r => setTimeout(r, 2500))
  
  // Login as guest
  const snap1 = execSync('agent-browser snapshot -i', { encoding: 'utf8' })
  const guestBtnMatch = snap1.match(/button "Jugar como invitado" \[ref=(\w+)\]/)
  if (guestBtnMatch) {
    execSync(`agent-browser click @${guestBtnMatch[1]}`, { stdio: 'inherit' })
    console.log('→ Clicked guest login')
  }
  await new Promise(r => setTimeout(r, 4000))
  
  // Navigate to profile
  const snap2 = execSync('agent-browser snapshot -i', { encoding: 'utf8' })
  const profileBtnMatch = snap2.match(/button[^[]*\[ref=(\w+)\][^\n]*\n[^\n]*Perfil/) 
    || snap2.match(/(\w+)[^\n]*Perfil/)
  // Just take a screenshot of welcome first
  execSync('agent-browser screenshot /home/z/my-project/download/weapons-welcome.png --full', { stdio: 'inherit' })
  console.log('✓ Saved welcome screenshot')
  
  execSync('agent-browser close', { stdio: 'inherit' })
}

main().catch(e => { console.error(e); process.exit(1) })
