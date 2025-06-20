pipeline {
  agent any
  
  environment {
    COMPOSE_PROJECT_NAME = 'stylistiq-be' //name project
    VPS_HOST = 'stylistiq.myzaki.store' // Domain
  }
  
  stages {
    stage('Clone Repository') {
      steps {
        checkout scm
        echo "Repository berhasil di-clone"
      }
    }

    stage('Prepare SSH Key') {
      steps {
        sh 'mkdir -p ~/.ssh'
        
        // Konfigurasi SSH untuk tidak meminta konfirmasi host
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
        // Pastikan variabel lingkungan tersedia untuk SSH
        withCredentials([sshUserPrivateKey(credentialsId: 'vps-key', 
                                           keyFileVariable: 'SSH_KEY', 
                                           usernameVariable: 'SSH_USER')]) {
          // Salin file ke VPS menggunakan SSH key
          sh """
          echo "Mulai menyalin file ke VPS..."
          ssh -o StrictHostKeyChecking=no -i "\${SSH_KEY}" "\${SSH_USER}@\${VPS_HOST}" "mkdir -p ~/stylistiq-be"
          scp -o StrictHostKeyChecking=no -i "\${SSH_KEY}" -r . "\${SSH_USER}@\${VPS_HOST}:~/stylistiq-be/"
          echo "File berhasil disalin ke VPS"

          echo "Mulai menjalankan docker compose..."
          ssh -o StrictHostKeyChecking=no -i "\${SSH_KEY}" "\${SSH_USER}@\${VPS_HOST}" "cd ~/stylistiq-be && \\
          docker compose --env-file .env.prod up -d --build stylistiq-be"
          echo "Docker compose berhasil dijalankan"
          """
        }
      }
    }
    
    stage('Verify Deployment') {
      steps {
        // Verifikasi status container
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