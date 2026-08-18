// src/services/supabase.js
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://mvnkjhobagmgvcvhyiwm.supabase.co';
// Thay bằng Publishable key mới (dạng sbp_...) lấy từ mục Settings > API Key
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_jxsLIFtLsgAzgmn-szr3ew_O4F-bscT';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);