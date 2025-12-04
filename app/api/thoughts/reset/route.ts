import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

// DELETE - Clear all thoughts from database (reset)
export async function DELETE() {
  try {
    // Delete all thoughts
    const { error } = await supabase
      .from("thoughts")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all (neq with impossible id)

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "All thoughts cleared" 
    });
  } catch (error) {
    console.error("Error resetting thoughts:", error);
    return NextResponse.json(
      { error: "Failed to reset thoughts" },
      { status: 500 }
    );
  }
}

