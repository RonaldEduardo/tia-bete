import { expect, test, type Page } from '@playwright/test'
const loadHome = async (page: Page) => { const response = page.waitForResponse(item => item.url().endsWith('/api/insulin/applications') && item.request().method() === 'GET'); await page.goto('/'); await response }
const createDueReminder = async (page: Page) => {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  await page.getByRole('button', { name: 'Criar lembrete' }).first().click()
  await page.locator('#reminder-time').fill(time)
  await page.getByRole('checkbox', { name: weekdays[now.getDay()]! }).check()
  await page.getByRole('button', { name: 'Criar lembrete' }).last().click()
}
const fillApplication = async (page: Page, type: 'basal' | 'rapid', name: string, units: string) => { await page.getByRole('button', { name: 'Registrar insulina' }).first().click(); await page.locator('#insulin-type').selectOption(type); await page.locator('#insulin-name').fill(name); await page.locator('#insulin-units').fill(units); await page.getByRole('button', { name: 'Salvar aplicação local' }).click() }
test.describe.serial('INS-REC-001', () => {
  test('registra basal sintética e preserva após reload', async ({ page }) => { await loadHome(page); await fillApplication(page, 'basal', 'Basal sintética', '12'); await expect(page.getByText('Aplicação registrada neste ambiente local.')).toBeVisible(); await expect(page.getByText('Basal sintética · 12 unidades')).toBeVisible(); await page.reload(); await expect(page.getByText('Basal sintética · 12 unidades')).toBeVisible(); await page.getByText('Ver detalhes').first().click(); await expect(page.getByText('Criado em')).toBeVisible() })
  test('registra rápida sintética', async ({ page }) => { await loadHome(page); await fillApplication(page, 'rapid', 'Rápida sintética', '4.5'); await expect(page.getByText('Rápida sintética · 4.5 unidades')).toBeVisible() })
  test('rejeita entrada inválida sem falso sucesso', async ({ page }) => { await loadHome(page); await page.getByRole('button', { name: 'Registrar insulina' }).first().click(); await page.locator('#insulin-name').fill('Teste'); await page.locator('#insulin-units').fill('0'); await page.getByRole('button', { name: 'Salvar aplicação local' }).click(); await expect(page.getByText('Informe um valor válido.')).toBeVisible(); await expect(page.locator('#insulin-form-title')).toBeVisible() })
  test('não altera nem conclui lembretes automaticamente', async ({ page }) => { await loadHome(page); await createDueReminder(page); await expect(page.getByText('Medir glicemia').last()).toBeVisible(); await fillApplication(page, 'basal', 'Basal sem lembrete', '10'); await expect(page.getByText('Medir glicemia').last()).toBeVisible(); await expect(page.getByText('Registro salvo e lembrete concluído automaticamente.')).toHaveCount(0) })
  test('não confirma sucesso quando a API de insulina falha', async ({ page }) => { await loadHome(page); await page.route('**/api/insulin/applications', async route => route.request().method() === 'POST' ? route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ message: 'Falha simulada.' }) }) : route.continue()); await fillApplication(page, 'basal', 'Falha sintética', '6'); await expect(page.getByText('Não foi possível salvar a aplicação local. Tente novamente.')).toBeVisible(); await expect(page.locator('#insulin-form-title')).toBeVisible(); await expect(page.getByText('Falha sintética · 6 unidades')).toHaveCount(0) })
})
