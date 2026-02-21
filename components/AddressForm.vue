<template>
  <v-form v-model="isFormValid" @submit.prevent="submit">
    <v-text-field
      v-model="address.zip_code"
      label="CEP"
      :rules="[rules.required]"
      @blur="fetchAddress"
      maxlength="9"
      variant="outlined"
      density="compact"
      class="mb-2"
    ></v-text-field>
    <v-text-field
      v-model="address.street"
      label="Rua"
      :rules="[rules.required]"
      variant="outlined"
      density="compact"
      class="mb-2"
    ></v-text-field>
    <v-row>
      <v-col cols="6">
        <v-text-field
          v-model="address.number"
          label="Número"
          :rules="[rules.required]"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-text-field>
      </v-col>
      <v-col cols="6">
        <v-text-field
          v-model="address.complement"
          label="Complemento"
          variant="outlined"
          density="compact"
          class="mb-2"
        ></v-text-field>
      </v-col>
    </v-row>
    <v-text-field
      v-model="address.neighborhood"
      label="Bairro"
      :rules="[rules.required]"
      variant="outlined"
      density="compact"
      class="mb-2"
    ></v-text-field>
    <v-text-field
      v-model="address.city"
      label="Cidade"
      :rules="[rules.required]"
      variant="outlined"
      density="compact"
      class="mb-2"
    ></v-text-field>
    <v-text-field
      v-model="address.state"
      label="Estado"
      :rules="[rules.required]"
      variant="outlined"
      density="compact"
      class="mb-2"
    ></v-text-field>
    <v-btn type="submit" color="primary" block :disabled="!isFormValid">
      Salvar Endereço
    </v-btn>
  </v-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import axios from 'axios'

const emit = defineEmits(['submit'])

const isFormValid = ref(false)
const address = reactive({
  zip_code: '',
  street: '',
  number: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
})

const rules = {
  required: (v: string) => !!v || 'Campo obrigatório.',
}

watch(() => address.zip_code, (newValue) => {
  let cleaned = newValue.replace(/\D/g, '')
  if (cleaned.length > 5) {
    cleaned = cleaned.slice(0, 5) + '-' + cleaned.slice(5, 8)
  }
  address.zip_code = cleaned
})

async function fetchAddress() {
  const cep = address.zip_code.replace(/\D/g, '')
  if (cep.length !== 8) return

  try {
    const { data } = await axios.get(`https://viacep.com.br/ws/${cep}/json/`)
    if (data.erro) return
    address.street = data.logradouro
    address.neighborhood = data.bairro
    address.city = data.localidade
    address.state = data.uf
    address.complement = data.complemento || ''
  } catch (error) {
    console.error("Erro ao buscar CEP:", error)
  }
}

function submit() {
  if (isFormValid.value) {
    // Garante que o zip_code seja enviado apenas com números
    const payload = { ...address, zip_code: address.zip_code.replace(/\D/g, '') }
    emit('submit', payload)
  }
}
</script>
