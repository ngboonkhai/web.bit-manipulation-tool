# 🧮 32-Bit Manipulation Tool

A visual and interactive web-based tool for performing bit-level operations on a 32-bit value. Designed to make bit manipulation intuitive, educational, and fun!

## 🌟 Features

- 🧠 Real-time 32-bit bit field (MSB on the left, LSB on the right)
- ✏️ Editable bits via individual input boxes
- 🔄 Bitwise operations:
  - Rotate Left / Rotate Right
  - Shift Left / Shift Right
  - 1’s Complement
  - Zero the field
- 🔢 Instant conversion:
  - Displays current value in **Hexadecimal** and **Decimal**
- 💡 Input support:
  - Fill bit field from a **hex** or **decimal** input
- ➕ Multiple independent instances:
  - Add as many copies as you like with the **+ Add** button (they grow downward)
  - Each copy has its own editable name (e.g. `CTRL`, `STATUS`) and can be removed with ✕
  - Copy the **hex** or **decimal** value of any copy with one click
- 🔍 Compare mode (opt-in via the **Compare** button):
  - Bits that differ from the first instance are outlined in the others
  - Pick any two instances and view their **XOR / AND / OR** result

## 📱 Responsive Design

- ✅ Mobile- and desktop-friendly
- ✨ Input boxes highlight when bit = `1` for better visibility

## 📆 Getting Started

1. Clone the repository:

   ```bash
   git clone https://github.com/ngboonkhai/web.bit-manipulation-tool.git
   cd web.bit-manipulation-tool
   ```

2. Open `index.html` in your browser.

That’s it — no dependencies required!

## 📁 Project Structure

```plaintext
.
├── index.html       # Main HTML page
├── style.css        # Styling for layout and responsiveness
└── script.js        # Core logic for bit manipulation
```

## 🚀 Demo

👉 [Live Demo](https://ngboonkhai.github.io/web.bit-manipulation-tool)

## 🛠️ To-Do / Ideas

- [ ] Grouping by 4 or 8 bits for better readability
- [ ] Dark mode toggle 🌙
- [ ] Copy/paste bit field
- [ ] Export to binary/hex/JSON

## 📄 License

MIT License — free to use, modify, and share!

---

Made with ❤️ for bit-level geeks, learners, and embedded developers.

