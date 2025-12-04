import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

// DELETE - Clear all thoughts from database (reset)
export async function DELETE() {
  try {
    console.log("🗑️ Starting to delete all thoughts...");
    
    // First, get count before delete
    const { count: beforeCount } = await supabase
      .from("thoughts")
      .select("*", { count: "exact", head: true });

    console.log(`Found ${beforeCount} thoughts before delete`);

    if (!beforeCount || beforeCount === 0) {
      return NextResponse.json({ 
        success: true, 
        message: "No thoughts to delete",
        deleted: 0
      });
    }

    // Try to delete all thoughts
    const { error: deleteError } = await supabase
      .from("thoughts")
      .delete()
      .gte("created_at", "1970-01-01");

    if (deleteError) {
      console.error("❌ Supabase delete error:", deleteError);
      return NextResponse.json({ 
        error: deleteError.message,
        hint: "You need to add a DELETE policy in Supabase. Go to SQL Editor and run: CREATE POLICY \"Anyone can delete thoughts\" ON thoughts FOR DELETE USING (true);"
      }, { status: 500 });
    }

    // Verify deletion by counting again
    const { count: afterCount } = await supabase
      .from("thoughts")
      .select("*", { count: "exact", head: true });

    console.log(`After delete: ${afterCount} thoughts remaining`);

    if (afterCount === beforeCount) {
      // Delete didn't work - RLS is blocking
      console.error("❌ Delete was blocked by RLS - thoughts still exist!");
      return NextResponse.json({ 
        error: "Delete blocked by Supabase RLS policy",
        hint: "Go to Supabase Dashboard → SQL Editor and run: CREATE POLICY \"Anyone can delete thoughts\" ON thoughts FOR DELETE USING (true);",
        beforeCount,
        afterCount
      }, { status: 403 });
    }

    const deleted = (beforeCount || 0) - (afterCount || 0);
    console.log(`✅ Successfully deleted ${deleted} thoughts`);

    return NextResponse.json({ 
      success: true, 
      message: `Deleted ${deleted} thoughts`,
      deleted
    });
  } catch (error: any) {
    console.error("Error resetting thoughts:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset thoughts" },
      { status: 500 }
    );
  }
}
