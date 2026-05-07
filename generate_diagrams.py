"""
Generate DFD (Level 0, 1, 2) and ERD diagrams for
University Facility Booking System.
Output: PNG files in the same folder as this script.
"""
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import os

OUT = os.path.dirname(os.path.abspath(__file__))

# ── colour palette ───────────────────────────────────────────────────────────
C_BG       = "#F8FAFE"
C_PROCESS  = "#2E74B5"   # blue  – processes (circles/rounded rect)
C_ENTITY   = "#1F3864"   # dark  – external entities (rectangles)
C_STORE    = "#E8F0FB"   # light – data stores (open rectangle)
C_STORE_BD = "#2E74B5"
C_ARROW    = "#333333"
C_TEXT_W   = "white"
C_TEXT_D   = "#1F3864"
C_ERD_ENT  = "#1F3864"
C_ERD_ATTR = "#E8F0FB"
C_ERD_REL  = "#D4A017"

def save(fig, name):
    path = os.path.join(OUT, name)
    fig.savefig(path, dpi=150, bbox_inches="tight", facecolor=C_BG)
    plt.close(fig)
    print(f"Saved: {path}")

def rounded_box(ax, x, y, w, h, color, text, tcolor=C_TEXT_W, fs=10, bold=False):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="round,pad=0.02", linewidth=1.5,
                         edgecolor="white", facecolor=color, zorder=3)
    ax.add_patch(box)
    ax.text(x, y, text, ha="center", va="center", fontsize=fs,
            color=tcolor, fontweight="bold" if bold else "normal",
            zorder=4, wrap=True,
            multialignment="center")

def rect_box(ax, x, y, w, h, color, edge, text, tcolor=C_TEXT_W, fs=10, bold=False):
    box = FancyBboxPatch((x - w/2, y - h/2), w, h,
                         boxstyle="square,pad=0.0", linewidth=2,
                         edgecolor=edge, facecolor=color, zorder=3)
    ax.add_patch(box)
    ax.text(x, y, text, ha="center", va="center", fontsize=fs,
            color=tcolor, fontweight="bold" if bold else "normal",
            zorder=4, multialignment="center")

def open_rect(ax, x, y, w, h, label):
    """Data store – open on left and right."""
    lx, rx = x - w/2, x + w/2
    by, ty = y - h/2, y + h/2
    ax.plot([lx, lx, rx, rx], [by, ty, ty, by], color=C_STORE_BD, linewidth=2, zorder=3)
    ax.fill_betweenx([by, ty], lx, rx, color=C_STORE, zorder=2)
    ax.text(x, y, label, ha="center", va="center", fontsize=9,
            color=C_TEXT_D, fontweight="bold", zorder=4, multialignment="center")

def arrow(ax, x0, y0, x1, y1, label="", color=C_ARROW, lw=1.4):
    ax.annotate("", xy=(x1, y1), xytext=(x0, y0),
                arrowprops=dict(arrowstyle="-|>", color=color,
                                lw=lw, mutation_scale=14), zorder=5)
    if label:
        mx, my = (x0+x1)/2, (y0+y1)/2
        ax.text(mx, my, label, ha="center", va="center",
                fontsize=7.5, color="#555555", zorder=6,
                bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.85))


# ════════════════════════════════════════════════════════════════════════════
# DFD LEVEL 0 — Context Diagram
# ════════════════════════════════════════════════════════════════════════════
def dfd_level0():
    fig, ax = plt.subplots(figsize=(13, 8))
    ax.set_facecolor(C_BG); fig.patch.set_facecolor(C_BG)
    ax.set_xlim(0, 13); ax.set_ylim(0, 8)
    ax.axis("off")

    # Title
    ax.text(6.5, 7.6, "DFD Level 0 — Context Diagram",
            ha="center", va="center", fontsize=15, fontweight="bold", color=C_TEXT_D)
    ax.text(6.5, 7.2, "University Facility Booking System",
            ha="center", va="center", fontsize=11, color="#555555")

    # Central process
    circle = plt.Circle((6.5, 3.9), 1.4, color=C_PROCESS, zorder=3)
    ax.add_patch(circle)
    ax.text(6.5, 3.9, "University\nFacility\nBooking\nSystem",
            ha="center", va="center", fontsize=10, color=C_TEXT_W,
            fontweight="bold", zorder=4, multialignment="center")

    # External entities
    # Student/User  (left)
    rect_box(ax, 1.4, 5.5, 2.0, 0.9, C_ENTITY, C_ENTITY, "Student / User",
             tcolor=C_TEXT_W, fs=10, bold=True)
    # Administrator (right)
    rect_box(ax, 11.6, 5.5, 2.0, 0.9, C_ENTITY, C_ENTITY, "Administrator",
             tcolor=C_TEXT_W, fs=10, bold=True)
    # Email Service (bottom)
    rect_box(ax, 6.5, 1.0, 2.2, 0.9, C_ENTITY, C_ENTITY, "Email Service\n(SMTP / Mailtrap)",
             tcolor=C_TEXT_W, fs=9.5, bold=True)

    # ── Arrows: Student ↔ System ──────────────────────────────────────────
    # Student → System
    arrow(ax, 2.4, 5.5, 5.18, 4.7, "Registration / Login\nBooking Request\nEdit / Cancel")
    # System → Student
    arrow(ax, 5.18, 4.2, 2.4, 5.1, "JWT Token\nBooking Confirmation\nBooking List")

    # ── Arrows: Admin ↔ System ───────────────────────────────────────────
    arrow(ax, 10.6, 5.5, 7.82, 4.7, "Manage Facilities\nManage Users\nView Statistics")
    arrow(ax, 7.82, 4.2, 10.6, 5.1, "System Reports\nAll Bookings\nUser List")

    # ── Arrows: System ↔ Email ───────────────────────────────────────────
    arrow(ax, 6.5, 2.5, 6.5, 1.45, "Booking Details\n(Confirmation Email)")

    # Legend
    legend_items = [
        mpatches.Patch(color=C_ENTITY, label="External Entity"),
        mpatches.Patch(color=C_PROCESS, label="System Process"),
    ]
    ax.legend(handles=legend_items, loc="lower right", fontsize=9,
              framealpha=0.9, edgecolor="#CCCCCC")

    save(fig, "DFD_Level0_Context.png")


# ════════════════════════════════════════════════════════════════════════════
# DFD LEVEL 1 — Major Processes  (swimlane-style, no crossing)
# ════════════════════════════════════════════════════════════════════════════
def dfd_level1():
    fig, ax = plt.subplots(figsize=(20, 13))
    ax.set_facecolor(C_BG); fig.patch.set_facecolor(C_BG)
    ax.set_xlim(0, 20); ax.set_ylim(0, 13)
    ax.axis("off")

    ax.text(10, 12.65, "DFD Level 1 — Major System Processes",
            ha="center", va="center", fontsize=16, fontweight="bold", color=C_TEXT_D)
    ax.text(10, 12.25, "University Facility Booking System",
            ha="center", va="center", fontsize=11, color="#555555")

    # Column x-coords
    XU  = 1.5    # Student / User column
    X1  = 4.2    # Process 1.0 + 3.0 column
    XDS = 7.5    # Data stores column
    X2  = 11.0   # Process 2.0 + 5.0 column
    X4  = 14.5   # Process 4.0 column
    XA  = 18.2   # Admin / Email column

    # ── External Entities ─────────────────────────────────────────────────
    rect_box(ax, XU,  10.5, 2.2, 0.9, C_ENTITY, C_ENTITY, "Student /\nUser", tcolor=C_TEXT_W, fs=10, bold=True)
    rect_box(ax, XA,  10.5, 2.2, 0.9, C_ENTITY, C_ENTITY, "Administrator",   tcolor=C_TEXT_W, fs=10, bold=True)
    rect_box(ax, XA,   2.0, 2.2, 0.9, C_ENTITY, C_ENTITY, "Email Service\n(SMTP)", tcolor=C_TEXT_W, fs=9, bold=True)

    # ── Processes ─────────────────────────────────────────────────────────
    rounded_box(ax, X1,  10.5, 2.6, 1.0, C_PROCESS, "1.0\nUser Authentication", fs=10)
    rounded_box(ax, X1,   6.5, 2.6, 1.0, C_PROCESS, "3.0\nBooking Management",  fs=10)
    rounded_box(ax, X2,  10.5, 2.8, 1.0, C_PROCESS, "2.0\nFacility Management", fs=10)
    rounded_box(ax, X2,   4.0, 2.6, 1.0, C_PROCESS, "5.0\nEmail Notification",  fs=10)
    rounded_box(ax, X4,  10.5, 2.6, 1.0, C_PROCESS, "4.0\nAdmin Management",    fs=10)

    # ── Data Stores ───────────────────────────────────────────────────────
    open_rect(ax, XDS, 10.5, 3.2, 0.72, "D1: Users")
    open_rect(ax, XDS,  8.0, 3.2, 0.72, "D2: Facilities")
    open_rect(ax, XDS,  5.5, 3.2, 0.72, "D3: Bookings")

    # ══ ARROWS ════════════════════════════════════════════════════════════
    # ── User → 1.0 ──
    arrow(ax, XU+1.1, 10.5, X1-1.3, 10.5, "Login / Register")
    # ── 1.0 → User (JWT) ──
    arrow(ax, X1-1.3, 10.2, XU+1.1, 10.2, "JWT Token")

    # ── 1.0 ↔ D1 (Users) ──
    arrow(ax, X1+1.3, 10.5, XDS-1.6, 10.5, "Read / Write\nUser Record")
    arrow(ax, XDS-1.6, 10.2, X1+1.3, 10.2, "User Data")

    # ── 2.0 ↔ D2 (Facilities) ──
    arrow(ax, X2-1.4, 10.5, XDS+1.6, 10.5, "")   # right-to-left at y=10.5
    arrow(ax, XDS+1.6, 10.5, XDS+1.6, 8.36, "")  # go down to D2
    arrow(ax, XDS+1.6, 8.36, XDS+1.6, 8.0,  "Write Facility")
    arrow(ax, XDS+1.2, 8.0,  XDS+1.2, 10.2, "")
    arrow(ax, XDS+1.2, 10.2, X2-1.4, 10.2,  "Facility Records")

    # ── User → 3.0 (Booking Request, vertical) ──
    arrow(ax, XU+1.1, 10.1, XU+1.1, 7.0, "")
    arrow(ax, XU+1.1, 7.0,  X1-1.3, 6.5, "Booking Request")
    # ── 3.0 → User (response) ──
    arrow(ax, X1-1.3, 6.2,  XU+1.3, 6.2, "")
    arrow(ax, XU+1.3, 6.2,  XU+1.3, 10.05, "Confirmation /\nError")

    # ── 3.0 ↔ D2 (read Facilities) ──
    arrow(ax, X1+1.3, 6.5,  XDS-1.6, 8.0, "Read Facilities")
    arrow(ax, XDS-1.6, 7.64, X1+1.3, 6.2, "Facility List")

    # ── 3.0 ↔ D3 (Bookings) ──
    arrow(ax, X1+1.3, 6.3,  XDS-1.6, 5.5, "Write Booking")
    arrow(ax, XDS-1.6, 5.14, X1+1.3, 6.1, "Booking Record")

    # ── 3.0 → 5.0 (Email trigger) ──
    arrow(ax, X1+1.3, 6.5,  X2-1.3, 4.5, "Booking Details")

    # ── 5.0 → Email Service ──
    arrow(ax, X2+1.3, 4.0,  XA-1.1, 4.0, "")
    arrow(ax, XA-1.1, 4.0,  XA-1.1, 2.45, "Email Payload")

    # ── Admin ↔ 4.0 ──
    arrow(ax, XA-1.1, 10.5, X4+1.3, 10.5, "Manage Commands")
    arrow(ax, X4+1.3, 10.2, XA-1.1, 10.2, "Reports / Lists")

    # ── 4.0 ↔ D1 (manage users) ──
    arrow(ax, X4-1.3, 10.5, XDS+1.6, 10.5, "")
    # (shares the same path as 2.0-D1 horizontal; use a slightly lower y)
    arrow(ax, X4-1.3, 10.1, XDS+1.8, 10.1, "")
    arrow(ax, XDS+1.8, 10.1, XDS+1.8, 10.86, "Read/Update\nUser Roles")

    # ── 4.0 → D3 (manage all bookings) ──
    arrow(ax, X4-1.3, 10.3, X4-1.3, 5.5, "")
    arrow(ax, X4-1.3, 5.5,  XDS+1.6, 5.5, "Read/Cancel\nAll Bookings")

    # ── 4.0 → 2.0 (facility admin commands) ──
    arrow(ax, X4-1.3, 10.5, X2+1.4, 10.5, "Facility CRUD")

    # ── Legend ────────────────────────────────────────────────────────────
    legend_items = [
        mpatches.Patch(color=C_ENTITY,  label="External Entity"),
        mpatches.Patch(color=C_PROCESS, label="Process"),
        mpatches.Patch(color=C_STORE,   label="Data Store", ec=C_STORE_BD),
    ]
    ax.legend(handles=legend_items, loc="lower left", fontsize=10,
              framealpha=0.9, edgecolor="#CCCCCC")

    save(fig, "DFD_Level1_Processes.png")


# ════════════════════════════════════════════════════════════════════════════
# DFD LEVEL 2 — Booking Management Decomposed
# ════════════════════════════════════════════════════════════════════════════
def dfd_level2():
    fig, ax = plt.subplots(figsize=(16, 10))
    ax.set_facecolor(C_BG); fig.patch.set_facecolor(C_BG)
    ax.set_xlim(0, 16); ax.set_ylim(0, 10)
    ax.axis("off")

    ax.text(8, 9.65, "DFD Level 2 — Booking Management (Process 3.0)",
            ha="center", va="center", fontsize=15, fontweight="bold", color=C_TEXT_D)
    ax.text(8, 9.3, "University Facility Booking System",
            ha="center", va="center", fontsize=11, color="#555555")

    # External Entity
    rect_box(ax, 1.2, 7.0, 1.8, 0.8, C_ENTITY, C_ENTITY, "User", tcolor=C_TEXT_W, fs=10, bold=True)

    # Sub-processes
    rounded_box(ax, 4.0, 8.0,  2.2, 0.85, C_PROCESS, "3.1\nValidate Inputs",       fs=9)
    rounded_box(ax, 7.5, 8.0,  2.2, 0.85, C_PROCESS, "3.2\nCheck Availability",    fs=9)
    rounded_box(ax, 11.0, 8.0, 2.2, 0.85, C_PROCESS, "3.3\nDetect Conflicts",      fs=9)
    rounded_box(ax, 11.0, 5.5, 2.2, 0.85, C_PROCESS, "3.4\nPersist Booking",       fs=9)
    rounded_box(ax, 7.5, 5.5,  2.2, 0.85, C_PROCESS, "3.5\nTrigger Email",         fs=9)
    rounded_box(ax, 4.0, 5.5,  2.2, 0.85, C_PROCESS, "3.6\nReturn Response",       fs=9)

    # Data Stores
    open_rect(ax, 7.5, 3.2, 3.0, 0.65, "D3: Bookings")
    open_rect(ax, 12.5, 6.5, 2.8, 0.65, "D2: Facilities")

    # External process ref
    rect_box(ax, 14.5, 5.5, 2.0, 0.8, "#888888", "#888888",
             "Process 5.0\nEmail Notify", tcolor=C_TEXT_W, fs=8.5)

    # Arrows
    # User → 3.1
    arrow(ax, 2.1, 7.2, 2.9, 7.85, "Booking Request\n(facility, date, times)")
    # 3.1 → 3.2
    arrow(ax, 5.1, 8.0, 6.4, 8.0, "Valid Data")
    # 3.1 → User (validation error)
    arrow(ax, 4.0, 7.57, 2.1, 7.0, "Validation Error")
    # 3.2 → D3 (query)
    arrow(ax, 7.5, 7.57, 7.5, 3.52, "Query Overlapping\nBookings")
    # D3 → 3.2
    arrow(ax, 7.8, 3.52, 7.8, 7.57, "Query Result")
    # 3.2 → 3.3
    arrow(ax, 8.6, 8.0, 9.9, 8.0, "Availability Flag")
    # 3.3 → 3.4 (no conflict)
    arrow(ax, 11.0, 7.57, 11.0, 5.92, "No Conflict\n→ Proceed")
    # 3.3 → User (conflict error)
    arrow(ax, 9.9, 8.3, 1.9, 7.4, "Conflict Error\n(409)")
    # 3.4 → D3 (write)
    arrow(ax, 10.2, 5.5, 9.0, 3.52, "Write Booking")
    # 3.4 → 3.5
    arrow(ax, 9.9, 5.5, 8.6, 5.5, "Created Booking")
    # 3.4 ↔ D2
    arrow(ax, 12.0, 5.92, 12.5, 6.17, "Validate Facility ID")
    arrow(ax, 12.5, 6.5, 12.2, 5.92, "Facility Record")
    # 3.5 → 5.0
    arrow(ax, 8.6, 5.5, 13.5, 5.5, "Booking + User\nDetails")
    # 3.5 → 3.6
    arrow(ax, 6.4, 5.5, 5.1, 5.5, "Pass Through")
    # 3.6 → User
    arrow(ax, 4.0, 5.07, 4.0, 4.2, "")
    arrow(ax, 4.0, 4.2, 1.8, 6.6, "Success Response\n(Booking Object)")

    # Legend
    legend_items = [
        mpatches.Patch(color=C_ENTITY,  label="External Entity"),
        mpatches.Patch(color=C_PROCESS, label="Sub-Process"),
        mpatches.Patch(color=C_STORE,   label="Data Store", ec=C_STORE_BD),
        mpatches.Patch(color="#888888", label="Ref. Process"),
    ]
    ax.legend(handles=legend_items, loc="lower right", fontsize=9,
              framealpha=0.9, edgecolor="#CCCCCC")

    save(fig, "DFD_Level2_BookingManagement.png")


# ════════════════════════════════════════════════════════════════════════════
# ERD — Entity Relationship Diagram
# ════════════════════════════════════════════════════════════════════════════
def erd():
    fig, ax = plt.subplots(figsize=(16, 10))
    ax.set_facecolor(C_BG); fig.patch.set_facecolor(C_BG)
    ax.set_xlim(0, 16); ax.set_ylim(0, 10)
    ax.axis("off")

    ax.text(8, 9.65, "Entity-Relationship Diagram (ERD)",
            ha="center", va="center", fontsize=15, fontweight="bold", color=C_TEXT_D)
    ax.text(8, 9.3, "University Facility Booking System",
            ha="center", va="center", fontsize=11, color="#555555")

    def entity_box(cx, cy, title, attrs, pk_index=0):
        row_h = 0.42
        w = 3.0
        total_h = row_h * (len(attrs) + 1)
        top = cy + total_h / 2

        # Header
        hdr = FancyBboxPatch((cx - w/2, top - row_h), w, row_h,
                             boxstyle="square,pad=0.0", linewidth=2,
                             edgecolor="white", facecolor=C_ERD_ENT, zorder=3)
        ax.add_patch(hdr)
        ax.text(cx, top - row_h/2, title, ha="center", va="center",
                fontsize=11, color="white", fontweight="bold", zorder=4)

        # Attribute rows
        for i, attr in enumerate(attrs):
            ry = top - row_h * (i + 2)
            shade = "#DDEEFF" if i % 2 == 0 else "white"
            row_box = FancyBboxPatch((cx - w/2, ry), w, row_h,
                                     boxstyle="square,pad=0.0", linewidth=1,
                                     edgecolor="#AACCEE", facecolor=shade, zorder=3)
            ax.add_patch(row_box)
            prefix = "🔑 " if i == pk_index else "   "
            is_pk = (i == pk_index)
            ax.text(cx - w/2 + 0.18, ry + row_h/2, attr,
                    ha="left", va="center", fontsize=8.5, color=C_TEXT_D,
                    fontweight="bold" if is_pk else "normal", zorder=4)

        # Outer border
        outer = FancyBboxPatch((cx - w/2, top - row_h * (len(attrs) + 1)),
                               w, row_h * (len(attrs) + 1),
                               boxstyle="square,pad=0.0", linewidth=2.5,
                               edgecolor=C_ERD_ENT, facecolor="none", zorder=5)
        ax.add_patch(outer)
        return cy - total_h / 2, cy + total_h / 2   # bottom, top y

    def relation_diamond(cx, cy, text):
        dx, dy = 0.7, 0.35
        xs = [cx, cx+dx, cx, cx-dx, cx]
        ys = [cy+dy, cy, cy-dy, cy, cy+dy]
        ax.fill(xs, ys, color=C_ERD_REL, zorder=3)
        ax.plot(xs, ys, color="#8B6A00", linewidth=1.5, zorder=4)
        ax.text(cx, cy, text, ha="center", va="center",
                fontsize=8, color="white", fontweight="bold", zorder=5)

    def rel_line(x0, y0, x1, y1, label_s="", label_e=""):
        ax.plot([x0, x1], [y0, y1], color="#555555", linewidth=1.5,
                linestyle="--", zorder=2)
        if label_s:
            ax.text(x0 + (x1-x0)*0.12, y0 + (y1-y0)*0.12, label_s,
                    ha="center", va="center", fontsize=9, color="#D9730D",
                    fontweight="bold", zorder=6,
                    bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.9))
        if label_e:
            ax.text(x0 + (x1-x0)*0.88, y0 + (y1-y0)*0.88, label_e,
                    ha="center", va="center", fontsize=9, color="#D9730D",
                    fontweight="bold", zorder=6,
                    bbox=dict(boxstyle="round,pad=0.15", fc="white", ec="none", alpha=0.9))

    # USER entity  (left)
    entity_box(2.8, 5.8, "USER", [
        "PK  id : INTEGER",
        "     name : VARCHAR(100)",
        "     email : VARCHAR(150) UNIQUE",
        "     password_hash : VARCHAR(255)",
        "     role : ENUM(user, admin)",
        "     is_active : BOOLEAN",
        "     createdAt : DATETIME",
        "     updatedAt : DATETIME",
    ])

    # BOOKING entity  (centre)
    entity_box(8.0, 5.2, "BOOKING", [
        "PK  id : INTEGER",
        "FK  user_id : INTEGER",
        "FK  facility_id : INTEGER",
        "     booking_date : DATE",
        "     start_time : VARCHAR(5)",
        "     end_time : VARCHAR(5)",
        "     purpose : VARCHAR(255)",
        "     status : ENUM(pending,confirmed,cancelled)",
        "     email_sent : BOOLEAN",
        "     createdAt : DATETIME",
        "     updatedAt : DATETIME",
    ])

    # FACILITY entity  (right)
    entity_box(13.2, 5.8, "FACILITY", [
        "PK  id : INTEGER",
        "     name : VARCHAR(100) UNIQUE",
        "     type : VARCHAR(50)",
        "     capacity : INTEGER",
        "     is_active : BOOLEAN",
        "     createdAt : DATETIME",
        "     updatedAt : DATETIME",
    ])

    # Relationship diamonds
    relation_diamond(5.4, 5.6, "MAKES")
    relation_diamond(10.6, 5.6, "FOR")

    # Lines  User — MAKES — BOOKING
    rel_line(4.3, 5.6, 4.7, 5.6, "1", "")
    rel_line(4.7, 5.6, 6.5, 5.6, "", "M")

    # Lines  BOOKING — FOR — FACILITY
    rel_line(9.5, 5.6, 9.9, 5.6, "M", "")
    rel_line(9.9, 5.6, 11.7, 5.6, "", "1")

    # Cardinality labels
    ax.text(4.35, 5.85, "1", fontsize=11, color=C_ERD_ENT, fontweight="bold")
    ax.text(6.3,  5.85, "M", fontsize=11, color=C_ERD_ENT, fontweight="bold")
    ax.text(9.5,  5.85, "M", fontsize=11, color=C_ERD_ENT, fontweight="bold")
    ax.text(11.5, 5.85, "1", fontsize=11, color=C_ERD_ENT, fontweight="bold")

    # Constraint note
    ax.text(8.0, 1.6,
            "UNIQUE CONSTRAINT: (facility_id, booking_date, start_time) — prevents double-bookings",
            ha="center", va="center", fontsize=9, color="#444444",
            bbox=dict(boxstyle="round,pad=0.4", fc="#FFF8E1", ec="#D9A500", linewidth=1.5))

    # Legend
    legend_items = [
        mpatches.Patch(color=C_ERD_ENT, label="Entity"),
        mpatches.Patch(color=C_ERD_REL, label="Relationship"),
        mpatches.Patch(color="#DDEEFF", label="Attribute", ec="#AACCEE"),
    ]
    ax.legend(handles=legend_items, loc="lower right", fontsize=9,
              framealpha=0.9, edgecolor="#CCCCCC")

    save(fig, "ERD_Diagram.png")


# ── Run all ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    dfd_level0()
    dfd_level1()
    dfd_level2()
    erd()
    print("\nAll diagrams saved successfully.")
