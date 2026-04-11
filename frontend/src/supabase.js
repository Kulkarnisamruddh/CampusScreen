import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://yhbdqdhtkxrhhmxlampx.supabase.co'
const supabaseKey = 'sb_publishable_sngd67cYcC_ykw26B7O70w_oI20bVOO'

export const supabase = createClient(supabaseUrl, supabaseKey)