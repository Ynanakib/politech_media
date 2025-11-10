<template>
  <main class="admin-panel">
    <!-- App Bar -->
    <div class="app-bar">
      <button class="menu-button" @click="toggleMenu">
        <svg viewBox="0 0 24 24" fill="white">
          <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/>
        </svg>
      </button>
      <h1 class="app-title">Панель администратора</h1>
    </div>

    <!-- Drawer Backdrop -->
    <div v-if="menuOpen" class="drawer-backdrop" @click="closeMenu"></div>

    <!-- Side Navigation Drawer -->
    <div class="drawer" :class="{ 'drawer-open': menuOpen }">
      <div class="drawer-content">
        <div class="drawer-header">
          <h2>Методы статистики</h2>
        </div>
        <div class="drawer-items">
          <button
            v-for="(endpoint, index) in endpoints"
            :key="index"
            class="drawer-item"
            :class="{ active: currentEndpoint === index }"
            @click="selectEndpoint(index)"
          >
            {{ endpoint.name }}
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="content">
      <div class="card">
        <h2 class="card-title">{{ currentEndpointData.name }}</h2>
        <p class="card-description">{{ currentEndpointData.description }}</p>

        <!-- Dynamic Form Fields -->
        <div class="form-container">
          <div v-for="(field, key) in currentEndpointData.fields" :key="key" class="form-field">
            <label class="label">{{ field.label }}</label>
            <input
              v-if="field.type === 'text' || field.type === 'number' || field.type === 'date'"
              v-model="formData[key]"
              :type="field.type"
              :placeholder="field.placeholder"
              class="input"
            />
            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="formData[key]"
              :placeholder="field.placeholder"
              class="textarea"
            />
            <select 
              v-else-if="field.type === 'select'"
              class="select"
              v-model="formData[key]">
              <option v-for="(option, key) in field.options" :value="option.val">{{ option.text }}</option>
            </select>
          </div>

          <!-- Submit Button -->
          <button class="submit-button" @click="submitRequest" :disabled="loading">
            <span v-if="loading">Loading...</span>
            <span v-else-if="currentEndpointData.type === 'open'">Скачать файл</span>
            <span v-else>{{ currentEndpointData.method === 'GET' ? 'Выполнить' : 'Подтвердить' }}</span>
          </button>
        </div>

        <!-- Response Display -->
        <div v-if="response" class="response-container">
          <!-- Tables for Top Schools, Top Schools with cities, Top Cities -->
          <div v-if="responseType.includes('table')" class="table-wrapper">
            <h3>{{ currentEndpointData.name }}</h3>
            <table class="analytics-table">
              <thead>
                <tr>
                  <th v-for="header in tableHeaders" :key="header">{{ header }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in tableData" :key="index">
                  <td v-for="header in tableHeaders" :key="header">{{ row[header] }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-if="responseType.includes('text')" class="response">
            <pre>{{ this.response }}</pre>
          </div>
          <div v-if="responseType.includes('chart')" id="chartResponse" :style="this.canvasStyle"></div>
        </div>
      </div>
    </div>
  </main>
</template>
  
<script>
import * as Script from '@/assets/Script.js'
import * as ChartJS from '@canvasjs/charts'
  
  export default {
  name: 'AdminView',
    data() {
      return {
      menuOpen: false,
      currentEndpoint: 0,
      loading: false,
      response: null,
      formData: {},
      my_vk_id: JSON.parse(Script.LocalStorage.get('vk_tokens')).vk_id,
      tableHeaders: [],
      tableData: [],
      responseType: "text",
      canvasStyle: {
        width: (window.innerWidth-142)+"px",
        height: (window.innerWidth-142)+"px"
      },
      endpoints: [
        {
          name: 'Удалить пользователя',
          method: 'GET',
          type: 'execute',
          path: '/api/v1/debug',
          description: 'Удаляет пользователя-администратора для повтроного тестирования всего приложения',
          fields: {
            vk_id: { label: 'VK ID администратора', type: 'text', placeholder: 'VK ID в виде цифр (например: 299484198)', autofill: true, required: true }
          },
          resultCallback: (request= {}, response = {}) => {
            this.responseType = "text"
            this.response = response
          }
        },
        {
          name: 'Добавить администратора',
          method: 'POST',
          type: 'execute',
          path: '/api/v2/admins/add',
          description: 'Добавить нового администратора системы',
          fields: {
            vk_id: { label: 'VK ID администратора', type: 'text', placeholder: 'VK ID в виде цифр (например: 299484198)', required: true }
          },
          resultCallback: (request= {}, response = {}) => {
            this.responseType = "text"
            this.response = response?.result === true ? "Администратор добавлен" : "Ошибка при добавлении"
          }
        },
        // {
        //   name: 'Проверка администратора',
        //   method: 'POST',
        //   type: 'execute',
        //   path: '/api/v2/is-admin',
        //   description: 'Check if user is admin',
        //   fields: {},
        //   resultCallback: (request= {}, response = {}) => {
        //     this.responseType = "text"
        //     this.response = response.is_admin ? "Вы администратор" : "Вы не являетесь администратором"
        //   }
        // },
        {
          name: 'Количество пользователей',
          method: 'POST',
          type: 'execute',
          path: '/api/v2/db-date',
          description: 'Показывет количество зарегестрированных пользователей за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день)',
          fields: {
            date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
            date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false }
          },
          resultCallback: (request= {}, response = {}) => {
            this.responseType = "text"
            this.response = "Количество новых пользователей: " + response.count
          }
        },
        {
          name: 'Топ школ по городам',
          method: 'POST',
          type: 'execute',
          path: '/api/v2/analytics/top-schools-with-cities',
          description: 'Показывает топ пользователей из школ, сгруппированных по городам за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день)',
          fields: {
            limit: { label: 'Количество', type: 'number', placeholder: '10', required: false },
            date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
            date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false }
          },
          resultCallback: (request= {}, response = {}) => {
            let r = JSON.parse(request)
            this.response = true
            if(r.limit > 10){
              this.responseType = "table"
            }else{
              this.responseType = 'table chart'
              setTimeout(()=>{
                let data = [];
                response.schools.forEach(element => {
                  data.push({label: element.school + ", г. " + element.city, y: element.count})
                })
                data.reverse()
                this.renderChart("Топ школ по городам", this.generateHeader(request), data)
              }, 20)
            }
            this.processTableData(response.schools)
          }
        },
        // {
        //   name: 'Топ школ',
        //   method: 'POST',
        //   type: 'execute',
        //   path: '/api/v2/analytics/top-schools',
        //   description: 'Топ школ по пользователям за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день)',
        //   fields: {
        //     limit: { label: 'Количество', type: 'number', placeholder: '10', required: false },
        //     date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
        //     date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false }
        //   },
        //   resultCallback: (request= {}, response = {}) => {
        //     this.responseType = "table"
        //     this.response = true
        //     this.processTableData(response.schools)
        //   }
        // },
        {
          name: 'Топ городов',
          method: 'POST',
          type: 'execute',
          path: '/api/v2/analytics/top-cities',
          description: 'Топ городов по количеству пользователей за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день)',
          fields: {
            limit: { label: 'Количество', type: 'number', placeholder: '10', required: false },
            date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
            date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false }
          },
          resultCallback: (request= {}, response = {}) => {
            let r = JSON.parse(request)
            this.response = true
            if(r.limit > 10){
              this.responseType = "table"
            }else{
              this.responseType = 'table chart'
              setTimeout(()=>{
                let data = [];
                response.cities.forEach(element => {
                  data.push({label: element.city, y: element.count})
                })
                data.reverse()
                this.renderChart("Топ городов", this.generateHeader(request), data)
              }, 20)
            }
            this.processTableData(response.cities)
          }
        },
        {
          name: 'Топ классов',
          method: 'POST',
          type: 'execute',
          path: '/api/v2/analytics/top-classes',
          description: 'Топ классов (12-й класс это СПО) по количеству пользователей за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день)',
          fields: {
            limit: { label: 'Количество', type: 'number', placeholder: '10', required: false },
            date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
            date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false }
          },
          resultCallback: (request= {}, response = {}) => {
            this.responseType = "chart"
            this.response = true
            setTimeout(()=>{
              let data = [];
              response.classes.forEach(element => {
                data.push({label: element.grade, y: element.count})
              })
              data.reverse()
              this.renderChart("Топ классов", this.generateHeader(request), data)
            }, 20)
          }
        },
        {
          name: 'Топ факультетов',
          method: 'POST',
          type: 'execute',
          path: '/api/v2/analytics/top-faculties',
          description: 'Топ факультетов по количесту результатов тестирования пользователей за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день)',
          fields: {
            limit: { label: 'Количество', type: 'number', placeholder: '10', required: false },
            date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
            date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false }
          },
          resultCallback: (request= {}, response = {}) => {
            this.responseType = "chart"
            this.response = true
            setTimeout(()=>{
              let data = [];
              response.faculties.forEach(element => {
                data.push({label: element.faculty_name, y: element.recommendation_count})
              })
              data.reverse()
              this.renderChart("Топ факультетов", this.generateHeader(request), data)
            }, 20)
          }
        },
        {
          name: 'Экспорт',
          method: 'GET',
          type: 'open',
          path: '/api/v2/export/excel',
          description: 'Генерация таблицы Excel из базы данных за определенный временной промежуток (если не указаны даты - за всё время, если только дата начала - только за этот день), класс - экспорт по кассам в которых учатся/учились люди из системы, факультет: akf, mtf, htf, gnf, sf, idst, etf, fpmm, gumf - экспорт по факультету',
          fields: {
            date_start: { label: 'Дата начала', type: 'date', placeholder: '02-10-2025', required: false },
            date_end: { label: 'Дата конца', type: 'date', placeholder: '05-10-2025', required: false },
            c: { label: 'Класс для экспорта', type: 'number', placeholder: '11', required: false },
            f: { label: 'Факультет экспорта', type: 'select', placeholder: 'gumf', required: false, options: [
              {val: 'akf', text: 'Аэрокосмический'}, 
              {val: 'mtf', text: 'Механико-технологический'}, 
              {val: 'htf', text: 'Химический'}, 
              {val: 'gnf', text: 'Горно-нефтяной'}, 
              {val: 'idst', text: 'Автодорожный'}, 
              {val: 'sf', text: 'Строительный'}, 
              {val: 'fpmm', text: 'Математики и механики'}, 
              {val: 'gumf', text: 'Гуманитарный'}, 
              {val: 'etf', text: 'Электротехнический'} 
            ] }
          },
          resultCallback: (request= {}, response = {}) => {
            this.responseType = "file"
            this.response = true
          }
        }
      ]
    }
  },
  computed: {
  currentEndpointData() {
    return this.endpoints[this.currentEndpoint]
  },
  },
  async beforeCreate(){
  },
  async mounted() {
    if(!this.is_admin()){
      this.$router.push("/")
    }else{
      this.initFormData()
    }
  },
  methods: {
    formatDateForApi(dateString) {
      if (!dateString) return dateString
      // Convert from yyyy-mm-dd to dd-mm-yyyy
      const parts = dateString.split('-')
      if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`
      }
      return dateString
    },
    toggleMenu() {
      if(this.is_admin()){
        this.menuOpen = !this.menuOpen
      }else{
          this.$router.push("/")
      }
    },
    closeMenu() {
      this.menuOpen = false
    },
    selectEndpoint(index) {
      this.currentEndpoint = index
      this.initFormData()
      this.response = null
      this.tableData = []
      this.tableHeaders = []
      this.closeMenu()
    },
    initFormData() {
      const data = {}      
      Object.keys(this.currentEndpointData.fields).forEach(key => {
          const field = this.currentEndpointData.fields[key]
          if (field.autofill === true) {
            // Handle special autofill cases
            if (key === 'vk_id') {
              data[key] = this.my_vk_id || ''
            } else {
              data[key] = ''
            }
          } else if (field.autofill != undefined && field.autofill !== true) {
            data[key] = field.autofill
          } else {
            data[key] = ''
          }
      })
      this.formData = data
    },
    async submitRequest() {
      this.loading = true
      this.response = null

      try {
        const endpoint = this.currentEndpointData
        let url = process.env.VUE_APP_BASE_URL + endpoint.path
        
        // Handle 'open' type - open in new tab
        if (endpoint.type === 'open') {
          const params = new URLSearchParams()
          // Add token for authentication
          const token = Script.LocalStorage.get('token')
          if (token) {
            params.append('token', token)
          }
          
          // Add form data as query params
          Object.keys(this.formData).forEach(key => {
            if (this.formData[key] !== '') {
              const value = this.currentEndpointData.fields[key]?.type === 'date'
                ? this.formatDateForApi(this.formData[key])
                : this.formData[key]
              params.append(key, value)
            }
          })
          
          if (params.toString()) {
            url += '?' + params.toString()
          }
          window.open(url, '_blank')
          this.loading = false
          return
        }
        
        // Handle 'execute' type - use fetch
        let body = null
        if (endpoint.method === 'POST') {
          const postData = {
            token: Script.LocalStorage.get('token')
          }
          Object.keys(this.formData).forEach(key => {
            if (this.formData[key] !== '') {
              if (key === 'limit' && this.formData[key]) {
                postData[key] = parseInt(this.formData[key])
              } else if (this.currentEndpointData.fields[key]?.type === 'date') {
                postData[key] = this.formatDateForApi(this.formData[key])
              } else {
                postData[key] = this.formData[key]
              }
            }
          })
          
          body = JSON.stringify(postData)

        } else {
          // Add query params for GET
          const params = new URLSearchParams()
          Object.keys(this.formData).forEach(key => {
            if (this.formData[key] !== '') {
              const value = this.currentEndpointData.fields[key]?.type === 'date' 
                ? this.formatDateForApi(this.formData[key])
                : this.formData[key]
              params.append(key, value)
            }
          })
          if (params.toString()) {
            url += '?' + params.toString()
          }
        }
        const response = await fetch(url, {
          method: endpoint.method,
          headers: {
            'Content-Type': 'application/json'
          },
          body: body
        })
        const responseData = await response.json()        
        endpoint.resultCallback(body, responseData)
      } catch (error) {
        console.log({ error: error.message })
      } finally {
        this.loading = false
      }
    },
    formatResponse(data) {
      return JSON.stringify(data, null, 2)
    },
    formatHeader(header) {
      return header.charAt(0).toUpperCase() + header.slice(1)
    },
    processTableData(response) {
      this.tableData = []
      this.tableHeaders = Object.keys(response[0])
      this.tableData = response
    },
    async is_admin(){
      const result = await fetch(process.env.VUE_APP_BASE_URL + '/api/v2/is-admin', {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        token: Script.LocalStorage.get("token")
      })
      }).then(e=>e.json()).then(e=>e.is_admin)
      if(!result){
        this.$router.push("/")
        return false
      }else{
        return false
      }
    },
    renderChart(title, axisY, data){
      let chart = new ChartJS.Chart("chartResponse", {
        theme: "light1", // "light1", "light2", "dark1", "dark2"
        animationEnabled: true,
        exportEnabled: true,
        title: {
          text: title,
          fontSize: 25
        },
        axisX: {
          margin: 10,
          labelPlacement: "inside",
          labelFontSize: 13,
          tickPlacement: "inside"
        },
        axisY2: {
          title: axisY,
          titleFontSize: 14,
          includeZero: true,
          suffix: ""
        },
        data: [{
          type: "bar",
          fontSize: 20,
          axisYType: "secondary",
          indexLabel: "{y}",
          dataPoints: data
        }]
      });
      chart.render();
    },
    generateHeader(request){
      let r = JSON.parse(request)
      console.log(r)
      if(r.date_start){
        if(r.date_end){
          return "C " + r.date_start + " по " + r.date_end
        }else{
          return "За " + r.date_start
        }
      }else{
        return "За все время"
      }
    }
  }
}
</script>

<style scoped>
#app{
  overflow: auto;
}
main{
  height: auto;
  min-height: var(--full-height);
}
.admin-panel {
  min-height: 100vh;
  background: #f5f5f5;
}

/* App Bar */
.app-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background: #1565C0;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  z-index: 1000;
}

.menu-button {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 12px;
  margin-right: 16px;
}

.menu-button svg {
  width: 24px;
  height: 24px;
}

.app-title {
  color: white;
  font-size: 20px;
  font-weight: 500;
  margin: 0;
}

/* Drawer */
.drawer {
  position: fixed;
  left: 0;
  top: 56px;
  width: 280px;
  height: calc(100vh - 56px);
  background: white;
  box-shadow: 2px 0 8px rgba(0,0,0,0.15);
  transform: translateX(-100%);
  transition: transform 0.3s ease;
  z-index: 999;
}

.drawer-open {
  transform: translateX(0);
}

.drawer-content {
  height: 100%;
  overflow-y: auto;
  padding: 16px 0;
}

.drawer-header {
  padding: 8px 16px;
  border-bottom: 1px solid #e0e0e0;
}

.drawer-header h2 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.drawer-items {
  padding: 8px 0;
}

.drawer-item {
  width: 100%;
  padding: 16px 24px;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: background-color 0.2s;
}

.drawer-item:hover {
  background: #f5f5f5;
}

.drawer-item.active {
  background: #E3F2FD;
  color: #1565C0;
  border-left: 3px solid #1565C0;
}

.drawer-backdrop {
  position: fixed;
  top: 56px;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.drawer-open .drawer-backdrop {
  opacity: 1;
  pointer-events: auto;
}

/* Content */
.content {
  margin-top: 56px;
  padding: 16px;
  overflow-y: scroll;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card-title {
  font-size: 24px;
  font-weight: 500;
  margin: 0 0 8px 0;
  color: #1565C0;
}

.card-description {
  color: #666;
  margin: 0 0 24px 0;
  font-size: 14px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.input,
.textarea,
.select {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
  color: #000;
  background-color: white;
}

.input:focus,
.textarea:focus,
.select:focus {
  outline: none;
  border-color: #1565C0;
}

.textarea {
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.submit-button {
  background: #1565C0;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #0D47A1;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.response-container {
  margin-top: 24px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 4px;
}

.response-container h3 {
  font-size: 16px;
  margin: 0 0 8px 0;
  color: #333;
}

.response {
  background: white;
  padding: 12px;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 12px;
  font-family: 'Courier New', monospace;
  border: 1px solid #ddd;
  text-align: left;
}

.table-wrapper {
  margin-top: 16px;
}

.analytics-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 12px;
  background: white;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.analytics-table thead {
  background: #1565C0;
  color: white;
}

.analytics-table th {
  text-align: center;
  padding: 12px;
  font-weight: 500;
  font-size: 14px;
}

.analytics-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
  font-size: 14px;
}

.analytics-table tbody tr:hover {
  background: #f5f5f5;
}

.chart-wrapper {
  margin-top: 16px;
}

.chart-container {
  width: 100%;
  height: 400px;
  margin-top: 16px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 16px;
}

.chart-container canvas {
  max-width: 100%;
}
/* Responsive */
@media (max-width: 600px) {
  .card {
    padding: 16px;
  }
  
  .card-title {
    font-size: 20px;
  }
}
</style>