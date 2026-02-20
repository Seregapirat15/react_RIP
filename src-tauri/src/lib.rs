#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    match tauri::Builder::default().run(tauri::generate_context!()) {
        Ok(_) => {}
        Err(e) => {
            eprintln!("Tauri application error: {e}");
            std::process::exit(1);
        }
    }
}
