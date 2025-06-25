pipeline {
  agent any
  
  environment {
    COMPOSE_PROJECT_NAME = 'stylistiq-be' 
    VPS_HOST = 'stylistiq.myzaki.store'
  }
  stages {
    stage('Clone Repository') {
      steps {
        checkout scm
        echo "Repository berhasil di-clone"
      }
    }

    stage('Show Commit Info') {
      steps {
        sh '''
          echo "✅ Commit yang sedang dideploy:"
          git log -1 --pretty=format:"%h - %an: %s"
        '''
      }
    }

    stage('Show Recent Commits') {
      steps {
        sh '''
          echo "📜 5 Commit terakhir yang dideploy:"
          git log -5 --pretty=format:"%h - %an: %s"
        '''
      }
    }
    
    stage('Prepare SSH Key') {
      steps {
        sh 'mkdir -p ~/.ssh'
        sh '''
          echo "Host $VPS_HOST
            StrictHostKeyChecking no
            UserKnownHostsFile=/dev/null
          " > ~/.ssh/config
          
          chmod 600 ~/.ssh/config
        '''
        echo "SSH Key preparation selesai"
      }
    }

    stage('Deploy to VPS') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'vps-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER'), file(credentialsId: 'env-prod', variable: 'ENV_FILE')]) {
        sh """
        echo "📁 Membuat direktori di VPS..."
        ssh -o StrictHostKeyChecking=no -i "\${SSH_KEY}" "\${SSH_USER}@\${VPS_HOST}" "mkdir -p ~/stylistiq-be"

        echo "📤 Menyalin source code (tanpa .env.prod)..."
        rsync -av --exclude='.env.prod' -e "ssh -o StrictHostKeyChecking=no -i \${SSH_KEY}" ./ "\${SSH_USER}@\${VPS_HOST}:~/stylistiq-be/"

        echo "📤 Menyalin .env.prod dari Credentials ke VPS..."
        scp -o StrictHostKeyChecking=no -i "\${SSH_KEY}" "\${ENV_FILE}" "\${SSH_USER}@\${VPS_HOST}:~/stylistiq-be/.env.prod"

        echo "🚀 Menjalankan docker compose di VPS..."
        ssh -o StrictHostKeyChecking=no -i "\${SSH_KEY}" "\${SSH_USER}@\${VPS_HOST}" "cd ~/stylistiq-be && docker compose --env-file .env.prod up -d --build app"

        echo "✅ Deployment berhasil dijalankan"
        """
        }
    }
    }
    
    stage('Verify Deployment') {
      steps {
        withCredentials([sshUserPrivateKey(credentialsId: 'vps-key', keyFileVariable: 'SSH_KEY', usernameVariable: 'SSH_USER')]) {
          sh """
            echo "Memeriksa container yang berjalan..."
            ssh -o StrictHostKeyChecking=no -i "\${SSH_KEY}" "\${SSH_USER}@\${VPS_HOST}" "docker ps"
          """
        }
        script {
          try {
            sh """
              echo "Memeriksa respons aplikasi..."
              curl -k -I https://\${VPS_HOST} || echo "Service might still be starting up"
            """
            echo "Deployment verification complete"
          } catch (Exception e) {
            echo "Warning: Could not verify service: ${e.message}"
          }
        }
      }
    }
  }
  
  post {
    success {
      echo "✅ Deployment successful! Application running at https://stylistiq.myzaki.store"
    }
    failure {
      echo "❌ Deployment failed. Check logs for details."
    }
    always {
      echo "📋 Deployment process completed at ${new Date()}"
    }
  }
}